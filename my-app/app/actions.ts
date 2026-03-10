"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Létrehozás (Create)
export async function addTodo(formData: FormData) {
  const title = formData.get("title") as string;
  await prisma.todo.create({ data: { title } });
  revalidatePath("/"); // Frissíti az oldalt, hogy látszódjon az új elem
}

// Törlés (Delete)
export async function deleteTodo(id: number) {
  await prisma.todo.delete({ where: { id } });
  revalidatePath("/");
}

// Állapot módosítása (Update)
export async function toggleTodo(id: number, completed: boolean) {
  await prisma.todo.update({
    where: { id },
    data: { completed: !completed },
  });
  revalidatePath("/");
}