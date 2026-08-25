"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";

import {
    registerSchema,
    loginSchema,
} from "@/lib/validations/auth";

import { eq } from "drizzle-orm";

export async function registerAction(formData: FormData) {
    const raw = {
        username: String(formData.get("username") ?? "").trim(),
        email: String(formData.get("email") ?? "")
            .trim()
            .toLowerCase(),
        password: String(formData.get("password") ?? ""),
    };

    const parsed = registerSchema.safeParse(raw);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0].message,
        };
    }

    const { username, email, password } = parsed.data;

    // Check username
    const existingUsername = await db.query.users.findFirst({
        where: eq(users.username, username),
    });

    if (existingUsername) {
        return {
            success: false,
            error: "That username is already taken.",
        };
    }

    // Check email
    const existingEmail = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingEmail) {
        return {
            success: false,
            error: "An account with that email already exists. Try logging in.",
        };
    }

    const supabase = await createClient();

    // Create Supabase authentication account
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    if (!data.user) {
        return {
            success: false,
            error: "Registration failed. Please try again.",
        };
    }

    // Create Cinephile profile
    try {
        await db.insert(users).values({
            id: data.user.id,
            username,
            email,
        });
    } catch (error) {
        console.error("REGISTER DATABASE ERROR:", error);

        return {
            success: false,
            error:
                "Your account could not be created. Please try again.",
        };
    }

    /*
     * If Supabase email confirmation is enabled,
     * session will be null.
     *
     * Tell the client to show the email confirmation screen.
     */
    if (!data.session) {
        return {
            success: true,
            requiresEmailConfirmation: true,
            email,
        };
    }

    // Email confirmation is disabled.
    // User is already logged in.
    return {
        success: true,
        requiresEmailConfirmation: false,
    };
}

export async function loginAction(formData: FormData) {
    const raw = {
        email: String(formData.get("email") ?? "")
            .trim()
            .toLowerCase(),
        password: String(formData.get("password") ?? ""),
    };

    const parsed = loginSchema.safeParse(raw);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0].message,
        };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword(
        parsed.data
    );

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    return {
        success: true,
    };
}

export async function logoutAction() {
    const supabase = await createClient();

    await supabase.auth.signOut();
}