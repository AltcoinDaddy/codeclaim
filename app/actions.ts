"use server"

import { getServerSide } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

type TaskType = "discord" | "telegram" | "twitter"

// Register a new user and record completed tasks in a single operation
export async function registerUserWithTasks(
  username: string,
  walletAddress: string,
  tasks: { discord: boolean; telegram: boolean; twitter: boolean },
  referrerUsername?: string,
) {
  try {
    const supabase = getServerSide()

    // Check if user already exists by username
    const { data: existingUser, error: checkError } = await supabase
      .from("waitlist")
      .select("id")
      .eq("username", username)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing user:", checkError)
      return {
        success: false,
        error: "Failed to check if username exists",
        errorDetail: checkError.message,
        code: "DATABASE_ERROR",
      }
    }

    let userId

    if (existingUser) {
      // Update existing user
      const { data, error: updateError } = await supabase
        .from("waitlist")
        .update({
          wallet_address: walletAddress,
          discord_completed: tasks.discord,
          telegram_completed: tasks.telegram,
          twitter_completed: tasks.twitter,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUser.id)
        .select("id")
        .single()

      if (updateError) {
        console.error("Error updating user:", updateError)
        return {
          success: false,
          error: "Failed to update user information",
          errorDetail: updateError.message,
          code: "UPDATE_ERROR",
        }
      }

      userId = data.id
    } else {
      // Create new user with task completion status
      const { data, error: insertError } = await supabase
        .from("waitlist")
        .insert({
          username,
          wallet_address: walletAddress,
          referrer_username: referrerUsername,
          discord_completed: tasks.discord,
          telegram_completed: tasks.telegram,
          twitter_completed: tasks.twitter,
          referral_count: 0,
        })
        .select("id")
        .single()

      if (insertError) {
        // Check for unique constraint violation
        if (insertError.code === "23505") {
          return {
            success: false,
            error: "Username already taken",
            errorDetail: insertError.message,
            code: "USERNAME_TAKEN",
          }
        }

        console.error("Error inserting user:", insertError)
        return {
          success: false,
          error: "Failed to create user",
          errorDetail: insertError.message,
          code: "INSERT_ERROR",
        }
      }

      userId = data.id

      // If there's a referrer, increment their referral count
      if (referrerUsername) {
        const { error: referralError } = await incrementReferralCount(referrerUsername)

        if (referralError) {
          console.error("Error incrementing referral count:", referralError)
          // We don't fail the whole operation if just the referral count update fails
        }
      }
    }

    revalidatePath("/")
    return { success: true, userId }
  } catch (error) {
    console.error("Error registering user:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
      errorDetail: (error as Error).message,
      code: "UNKNOWN_ERROR",
    }
  }
}

// Record a completed task
export async function recordCompletedTask(userId: string, taskType: TaskType) {
  try {
    const supabase = getServerSide()

    // Update the specific task field based on the task type
    const updateData: Record<string, boolean> = {
      [`${taskType}_completed`]: true,
    }

    const { error } = await supabase.from("waitlist").update(updateData).eq("id", userId)

    if (error) {
      console.error("Error updating task completion:", error)
      return {
        success: false,
        error: "Failed to record task completion",
        errorDetail: error.message,
        code: "UPDATE_ERROR",
      }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error recording completed task:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
      errorDetail: (error as Error).message,
      code: "UNKNOWN_ERROR",
    }
  }
}

// Increment referral count for a user
async function incrementReferralCount(username: string) {
  try {
    const supabase = getServerSide()

    const { error } = await supabase.rpc("increment_referral_count", { username_param: username })

    // If the RPC function doesn't exist, fall back to a direct update
    if (error && error.message.includes("does not exist")) {
      const { error: updateError } = await supabase
        .from("waitlist")
        .update({ referral_count: supabase.sql`referral_count + 1` })
        .eq("username", username)

      if (updateError) {
        return { error: updateError }
      }
    } else if (error) {
      return { error }
    }

    return { success: true }
  } catch (error) {
    return { error }
  }
}

// Get referral stats for a user
export async function getReferralStats(username: string) {
  try {
    const supabase = getServerSide()

    const { data, error } = await supabase
      .from("waitlist")
      .select("referral_count")
      .eq("username", username)
      .maybeSingle()

    if (error) {
      console.error("Error getting referral stats:", error)
      return {
        success: false,
        error: "Failed to get referral statistics",
        errorDetail: error.message,
        code: "QUERY_ERROR",
        count: 0,
      }
    }

    return { success: true, count: data?.referral_count || 0 }
  } catch (error) {
    console.error("Error getting referral stats:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
      errorDetail: (error as Error).message,
      code: "UNKNOWN_ERROR",
      count: 0,
    }
  }
}

// Check if a user exists
export async function checkUserExists(username: string) {
  try {
    if (!username || username.length < 3) {
      return {
        success: false,
        error: "Username must be at least 3 characters",
        code: "VALIDATION_ERROR",
        exists: false,
      }
    }

    const supabase = getServerSide()

    const { data, error } = await supabase.from("waitlist").select("id").eq("username", username).maybeSingle()

    if (error) {
      console.error("Error checking if user exists:", error)
      return {
        success: false,
        error: "Failed to check username availability",
        errorDetail: error.message,
        code: "QUERY_ERROR",
        exists: false,
      }
    }

    return { success: true, exists: !!data }
  } catch (error) {
    console.error("Error checking if user exists:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
      errorDetail: (error as Error).message,
      code: "UNKNOWN_ERROR",
      exists: false,
    }
  }
}

// Get task completion status for a user
export async function getTaskCompletionStatus(userId: string) {
  try {
    const supabase = getServerSide()

    const { data, error } = await supabase
      .from("waitlist")
      .select("discord_completed, telegram_completed, twitter_completed")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error getting task completion status:", error)
      return {
        success: false,
        error: "Failed to get task completion status",
        errorDetail: error.message,
        code: "QUERY_ERROR",
        tasks: {
          discord: false,
          telegram: false,
          twitter: false,
        },
      }
    }

    return {
      success: true,
      tasks: {
        discord: data.discord_completed,
        telegram: data.telegram_completed,
        twitter: data.twitter_completed,
      },
    }
  } catch (error) {
    console.error("Error getting task completion status:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
      errorDetail: (error as Error).message,
      code: "UNKNOWN_ERROR",
      tasks: {
        discord: false,
        telegram: false,
        twitter: false,
      },
    }
  }
}

// Validate wallet address
export async function validateWalletAddress(address: string) {
  try {
    // Ethereum address validation
    const ethRegex = /^0x[a-fA-F0-9]{40}$/
    const isEthAddress = ethRegex.test(address)

    // Solana address validation (base58 encoded, 32-44 characters)
    const solRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
    const isSolAddress = solRegex.test(address)

    // Add more blockchain validations as needed

    if (isEthAddress) {
      return { success: true, valid: true, chain: "ethereum" }
    } else if (isSolAddress) {
      return { success: true, valid: true, chain: "solana" }
    } else {
      return {
        success: true,
        valid: false,
        error: "Invalid wallet address format",
        code: "INVALID_FORMAT",
      }
    }
  } catch (error) {
    return {
      success: false,
      valid: false,
      error: "Failed to validate wallet address",
      errorDetail: (error as Error).message,
      code: "VALIDATION_ERROR",
    }
  }
}
