"use server";

import bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { auth, unstable_update } from "@/config/auth";
import prisma from "@/lib/prisma";

// Types
// Define state types for useActionState
export interface ProfileState {
  success: boolean;
  zodErrors?: {
    _form?: string;
    name?: string[];
    bio?: string[];
    image?: string[];
  };
  image?: string | null;
  message?: string | null; // General message property
}

export interface PasswordState {
  success: boolean;
  zodErrors?: {
    _form?: string;
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
  };
  message?: string | null; // General message property
}

// Update profile schema
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
});

// Update password schema
const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Helper function to save an uploaded image
async function saveImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename
  const filename = `${uuidv4()}-${file.name.replace(/\s/g, "-")}`;

  // Define the path where the image will be saved
  const imagePath = join(process.cwd(), "public", "uploads", filename);
  const image = `/uploads/${filename}`;

  // Ensure the directory exists
  const fs = require("fs");
  const dir = join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the file
  await writeFile(imagePath, buffer);

  return image;
}

// Update profile action
export async function updateProfile(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Authentication required." };
    }

    const validatedFields = updateProfileSchema.safeParse({
      name: formData.get("name"),
      bio: formData.get("bio"),
    });

    if (!validatedFields.success) {
      return {
        ...prevState,
        success: false,
        zodErrors: validatedFields.error.flatten().fieldErrors,
        message: "Invalid data provided",
      };
    }

    const { name, bio } = validatedFields.data;

    // Handle avatar upload if present
    let image = undefined;
    const avatarFile = formData.get("avatar") as File;
    if (avatarFile && avatarFile.size > 0) {
      try {
        image = await saveImage(avatarFile);
      } catch (error) {
        console.error("Error saving image:", error);
        return { success: false, message: "Failed to upload image" };
      }
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio: bio || null,
        ...(image && { image }),
      },
    });

    // Update session
    await unstable_update({
      user: {
        name: updatedUser.name,
        bio: updatedUser.bio,
        ...(image && { image }),
      },
    });

    return {
      ...prevState,
      success: true,
      message: "Profile updated successfully!",
      image: image || updatedUser.image,
    };
  } catch (error: any) {
    console.error("Failed to update profile:", error);
    return {
      ...prevState,
      success: false,
      zodErrors: {
        _form: error.message || "Something went wrong",
      },
      message: "Failed to update profile",
    };
  }
}

// Update password action
export async function updatePassword(
  prevState: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    const validatedFields = updatePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Invalid data provided",
        zodErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user || !user.password) {
      return { success: false, message: "User not found" };
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return { success: false, message: "Current password is incorrect" };
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return {
      ...prevState,
      success: true,
      message: "Password updated successfully!",
    };
  } catch (error) {
    console.error("Failed to update password:", error);
    return {
      ...prevState,
      success: false,
      zodErrors: {
        _form:
          error instanceof Error ? error.message : "Failed to update password",
      },
      message: "Failed to update password",
    };
  }
}
