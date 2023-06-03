import { SlackAPIClient } from "deno-slack-api/types.ts";
import { DefineFunction, DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { WelcomeMessageDatastore } from "../datastores/messages.ts";
import { SendWelcomeToNewUser } from "../workflows/send_welcome_to_new_user.ts";

export const SendMessagetoDataStoreFunction = DefineFunction({
  callback_id: "welcome_message_setup_function",
  title: "Welcome Message Setup",
  description: "Takes a welcome message and stores it in the datastore",
  source_file: "functions/create_welcome_message.ts",
  input_parameters: {
    properties: {
      message: {
        type: Schema.types.string,
      },
      channel: {
        type: Schema.slack.types.channel_id,
        description: "Channel to post in",
      },
      author: {
        type: Schema.slack.types.user_id,
        description:
          "The user ID of the person who created the welcome message",
      },
    },
    required: ["message", "channel"]
  },
});

export default SlackFunction(
  SendMessagetoDataStoreFunction,
  async ({inputs, client}) => {
    const uuid = crypto.randomUUID();
    const putResponse = await client.apps.datastore.put<typeof WelcomeMessageDatastore.definition>({
      datastore: WelcomeMessageDatastore.name,
      item: { id: uuid, channel: inputs.channel, message: inputs.message, author: inputs.author },
    }); 
    if (!putResponse.ok) {
      return { error: `Failed to save welcome message: ${putResponse.error}`};
    }

    // Search for any existing triggers for the welcome workflow
    const triggers = await findUserJoinedChannelTrigger(client, inputs.channel);
    if (triggers.error) {
      return { error: `Failed to lookup existing triggers: ${triggers.error}` };
    }

    // Create a new user_joined_channel trigger if none exist
    if (!triggers.exists) {
      const newTrigger = await saveUserJoinedChannelTrigger(client, inputs.channel, inputs.message);
      if (!newTrigger.ok) {
        return {
          error: `Failed to create welcome trigger: ${newTrigger.error}`,
        };
      }
    }

    return { outputs: {} };
  },
  );


  /**
 * findUserJoinedChannelTrigger returns if the user_joined_channel trigger
 * exists for the "Send Welcome Message" workflow in a channel.
 */
export async function findUserJoinedChannelTrigger(
  client: SlackAPIClient,
  channel: string,
): Promise<{ error?: string; exists?: boolean }> {
  // Collect all existing triggers created by the app
  const allTriggers = await client.workflows.triggers.list({ is_owner: true });
  if (!allTriggers.ok) {
    return { error: allTriggers.error };
  }

  // Find user_joined_channel triggers for the "Send Welcome Message"
  // workflow in the specified channel
  const joinedTriggers = allTriggers.triggers.filter((trigger) => (
    trigger.workflow.callback_id ===
    SendWelcomeToNewUser.definition.callback_id &&
    trigger.event_type === "slack#/events/user_joined_channel" &&
    trigger.channel_ids.includes(channel)
  ));

  // Return if any matching triggers were found
  const exists = joinedTriggers.length > 0;
  return { exists };

  // const exists = true
  // return { exists };
}

/**
 * saveUserJoinedChannelTrigger creates a new user_joined_channel trigger
 * for the "Send Welcome Message" workflow in a channel.
 */
export async function saveUserJoinedChannelTrigger(
  client: SlackAPIClient,
  channelK: string,
  messageK: string
): Promise<{ ok: boolean; error?: string }> {
  const triggerResponse = await client.workflows.triggers.create<
    typeof SendWelcomeToNewUser.definition
  >({
    type: "event",
    name: "User joined channel",
    description: "Send a message when a user joins the channel",
    workflow: "#/workflows/sendwelcometonewuser_workflow",
    event: {
      event_type: "slack#/events/user_joined_channel",
      channel_ids: [channelK],
    },
    inputs: {
      channelIdFun: { value: channelK },
      triggeredUserId: { value: "{{data.user_id}}" },
      messageToSend: {value: messageK },
    },
  });

  if (!triggerResponse.ok) {
    return { ok: false, error: triggerResponse.error };
  }
  return { ok: true };
}