'use server';

import { signIn } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { z } from 'zod';

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
});

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        const rawFormData = Object.fromEntries(formData);
        const validatedFields = formSchema.safeParse(rawFormData);

        if (!validatedFields.success) {
            return 'Please enter a valid email and password.';
        }

        await signIn('credentials', {
            ...validatedFields.data,
            redirect: false,
        });

        return undefined; // No error on success, client will redirect
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function register(prevState: string | undefined, formData: FormData) {
    try {
        const rawFormData = Object.fromEntries(formData);
        const validatedFields = formSchema.safeParse(rawFormData);

        if (!validatedFields.success) {
            return 'Please check your input.';
        }

        const { email, password } = validatedFields.data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return 'User already exists.';
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        return undefined; // Success
    } catch (error) {
        return 'Failed to create user.';
    }
}
