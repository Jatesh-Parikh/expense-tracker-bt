"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface TransactionData {
  text: string;
  amount: number;
}

interface TransactionResult {
  data?: TransactionData;
  error?: string;
}

async function addTransaction(formData: FormData): Promise<TransactionResult> {
  const textValue = formData.get("text");
  const amountValue = formData.get("amount");

  // Check for input values
  if (!textValue || !amountValue || textValue === "") {
    return { error: "Text or amount is missing" };
  }

  // Ensure the value to be stored in the db has the correct data type
  const text: string = textValue.toString();
  const amount: number = parseFloat(amountValue.toString());

  // Getting the logged in user
  const { userId } = auth();

  // Check for user
  if (!userId) {
    return { error: "User not found" };
  }

  try {
    const transactionData: TransactionData = await db.transaction.create({
      data: {
        text,
        amount,
        userId,
      },
    });

    revalidatePath("/");

    return { data: transactionData };
  } catch (error) {
    return { error: "Transaction not added" };
  }
}

export default addTransaction;
