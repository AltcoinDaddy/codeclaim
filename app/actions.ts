"use server"

import { getServerSide } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

type TaskType = "discord" | "telegram" | "twitter" | "tweet"

// Update the registerUserWithTasks function to fix referral counting
export async function registerUserWithTasks(
  username: string | null,
  walletAddress: string,
  tasks: { discord: boolean; telegram: boolean; twitter: boolean; tweet: boolean },
  referrerUsername?: string,
) {
  try {
    console.log("Starting user registration with:", { username, walletAddress, tasks, referrerUsername })
    const supabase = getServerSide()

    // Generate a random username if none provided
    const finalUsername = username || `user_${randomUUID().substring(0, 8)}`

    // Check if user already exists by username
    const { data: existingUser, error: checkError } = await supabase
      .from("waitlist")
      .select("id")
      .eq("username", finalUsername)
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

    // Check if wallet address already exists
    const { data: existingWallet, error: walletCheckError } = await supabase
      .from("waitlist")
      .select("id")
      .eq("wallet_address", walletAddress)
      .maybeSingle()

    if (walletCheckError) {
      console.error("Error checking existing wallet:", walletCheckError)
      return {
        success: false,
        error: "Failed to check if wallet exists",
        errorDetail: walletCheckError.message,
        code: "DATABASE_ERROR",
      }
    }

    if (existingWallet && !existingUser) {
      console.log("Wallet address already exists for a different user")
      return {
        success: false,
        error: "Wallet address already registered",
        code: "WALLET_TAKEN",
      }
    }

    let userId

    if (existingUser) {
      console.log("Updating existing user:", existingUser.id)
      // Update existing user
      const { data, error: updateError } = await supabase
        .from("waitlist")
        .update({
          wallet_address: walletAddress,
          discord_completed: tasks.discord,
          telegram_completed: tasks.telegram,
          twitter_completed: tasks.twitter,
          tweet_completed: tasks.tweet,
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
      console.log("Creating new user with username:", finalUsername)
      // Create new user with task completion status
      try {
        const { data, error: insertError } = await supabase
          .from("waitlist")
          .insert({
            username: finalUsername,
            wallet_address: walletAddress,
            referrer_username: referrerUsername,
            discord_completed: tasks.discord,
            telegram_completed: tasks.telegram,
            twitter_completed: tasks.twitter,
            tweet_completed: tasks.tweet,
            referral_count: 0,
          })
          .select("id")
          .single()

        if (insertError) {
          // Check for unique constraint violation
          if (insertError.code === "23505") {
            if (insertError.message.includes("username")) {
              return {
                success: false,
                error: "Username already taken",
                errorDetail: insertError.message,
                code: "USERNAME_TAKEN",
              }
            } else if (insertError.message.includes("wallet_address")) {
              return {
                success: false,
                error: "Wallet address already registered",
                errorDetail: insertError.message,
                code: "WALLET_TAKEN",
              }
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
          // Convert referrer username to lowercase for case-insensitive comparison
          const normalizedReferrerUsername = referrerUsername.toLowerCase()
          console.log(
            `Incrementing referral count for referrer: ${normalizedReferrerUsername} (normalized from ${referrerUsername})`,
          )

          try {
            // First check if referrer exists - using case-insensitive query
            const { data: referrerData, error: referrerCheckError } = await supabase
              .from("waitlist")
              .select("id, referral_count, username")
              .ilike("username", normalizedReferrerUsername)
              .maybeSingle()

            if (referrerCheckError) {
              console.error("Error checking referrer:", referrerCheckError)
            } else if (referrerData) {
              console.log(
                `Referrer found: ${referrerData.username}, current count: ${referrerData.referral_count || 0}`,
              )

              // Referrer exists, increment their count directly
              const newCount = (referrerData.referral_count || 0) + 1
              console.log(
                `Updating referral count to ${newCount} for user ${referrerData.username} (${referrerData.id})`,
              )
              console.log(`Previous referral count was: ${referrerData.referral_count || 0}`)

              const { error: updateError } = await supabase
                .from("waitlist")
                .update({ referral_count: newCount })
                .eq("id", referrerData.id)

              if (updateError) {
                console.error("Error updating referral count:", updateError)
              } else {
                console.log(`Successfully updated referral count for ${referrerData.username} to ${newCount}`)
                console.log(`This is the ONLY place where referral_count should be incremented`)
              }
            } else {
              console.log(`Referrer not found: ${normalizedReferrerUsername}`)
            }
          } catch (refError) {
            // Don't fail the whole registration if referral update fails
            console.error("Error processing referral:", refError)
          }
        }
      } catch (insertCatchError) {
        console.error("Exception during user insertion:", insertCatchError)
        return {
          success: false,
          error: "Exception during user creation",
          errorDetail: (insertCatchError as Error).message,
          code: "INSERT_EXCEPTION",
        }
      }
    }

    revalidatePath("/")
    console.log("Registration successful for user:", userId)
    return { success: true, userId, username: finalUsername }
  } catch (error) {
    console.error("Error registering user:", error)
    return {
      success: false,
      error: "An unexpected error occurred during registration",
      errorDetail: (error as Error).message,
      code: "UNKNOWN_ERROR",
    }
  }
}

// Add a dedicated function to increment referral count
export async function incrementReferralCount(referrerUsername: string) {
  try {
    // Normalize the username to lowercase for case-insensitive comparison
    const normalizedUsername = referrerUsername.toLowerCase()
    console.log(`Manually incrementing referral count for: ${normalizedUsername} (normalized from ${referrerUsername})`)
    const supabase = getServerSide()

    // First get the current count - using case-insensitive query
    const { data: referrer, error: fetchError } = await supabase
      .from("waitlist")
      .select("id, referral_count")
      .ilike("username", normalizedUsername)
      .single()

    if (fetchError) {
      console.error("Error fetching referrer:", fetchError)
      return {
        success: false,
        error: "Failed to fetch referrer information",
        errorDetail: fetchError.message,
      }
    }

    if (!referrer) {
      return {
        success: false,
        error: "Referrer not found",
      }
    }

    // Increment the count
    const newCount = (referrer.referral_count || 0) + 1

    const { error: updateError } = await supabase
      .from("waitlist")
      .update({ referral_count: newCount })
      .eq("id", referrer.id)

    if (updateError) {
      console.error("Error updating referral count:", updateError)
      return {
        success: false,
        error: "Failed to update referral count",
        errorDetail: updateError.message,
      }
    }

    revalidatePath("/")
    return {
      success: true,
      newCount,
      message: `Successfully incremented referral count to ${newCount}`,
    }
  } catch (error) {
    console.error("Error incrementing referral count:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
      errorDetail: (error as Error).message,
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

// Update the getReferralStats function to be more reliable
export async function getReferralStats(username: string) {
  try {
    if (!username) {
      return {
        success: false,
        error: "Username is required",
        code: "VALIDATION_ERROR",
        count: 0,
      }
    }

    // Normalize the username to lowercase for case-insensitive comparison
    const normalizedUsername = username.toLowerCase()
    const supabase = getServerSide()

    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select("referral_count")
        .ilike("username", normalizedUsername)
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

      console.log(`Retrieved referral count for ${normalizedUsername}:`, data?.referral_count || 0)

      return {
        success: true,
        count: data?.referral_count || 0,
        message: "Referral stats retrieved successfully",
      }
    } catch (queryError) {
      console.error("Error in Supabase query:", queryError)
      return {
        success: false,
        error: "Database query failed",
        errorDetail: (queryError as Error).message,
        code: "QUERY_ERROR",
        count: 0,
      }
    }
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

    // Normalize the username to lowercase for case-insensitive comparison
    const normalizedUsername = username.toLowerCase()
    const supabase = getServerSide()

    const { data, error } = await supabase
      .from("waitlist")
      .select("id")
      .ilike("username", normalizedUsername)
      .maybeSingle()

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
      .select("discord_completed, telegram_completed, twitter_completed, tweet_completed")
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
          tweet: false,
        },
      }
    }

    return {
      success: true,
      tasks: {
        discord: data.discord_completed,
        telegram: data.telegram_completed,
        twitter: data.twitter_completed,
        tweet: data.tweet_completed,
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
        tweet: false,
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
