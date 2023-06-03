import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SendMessagetoDataStoreFunction } from "../functions/create_welcome_message.ts";


export const MessageSetupWorkflow = DefineWorkflow({
  callback_id: "message_setup_workflowddd",
  title: "Create Welcome Message",
  description: " Creates a message to welcome new users into the channel.",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity"]
  }
});


export const newForm = MessageSetupWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Welcome Message Form",
    submit_label: "Submit",
    description: ":wave: Create a welcome message for a channel!",
    interactivity: MessageSetupWorkflow.inputs.interactivity,
    fields: {
      required: ["channel", "messageInput"],
      elements: [
        {
          name: "messageInput",
          title: "Your welcome message kinder",
          type: Schema.types.string,
          long: true,
        },
        {
          name: "channel",
          title: "Select a channel to post this message in",
          type: Schema.slack.types.channel_id,
          default: MessageSetupWorkflow.inputs.channel,
        },
      ],
    },
  }
);

MessageSetupWorkflow.addStep(Schema.slack.functions.SendEphemeralMessage, {
  channel_id: newForm.outputs.fields.channel,
  user_id: MessageSetupWorkflow.inputs.interactivity.interactor.id,
  message:
    `Your welcome message for this channel was successfully created! :white_check_mark:`,
});

MessageSetupWorkflow.addStep(SendMessagetoDataStoreFunction, {
  message: newForm.outputs.fields.messageInput,
  channel: newForm.outputs.fields.channel,
  author: MessageSetupWorkflow.inputs.interactivity.interactor.id,
});

// MessageSetupWorkflow.addStep(Schema.slack.functions.SendMessage, {
//   channel_id: newForm.outputs.fields.channel,
//   user_id: MessageSetupWorkflow.inputs.interactivity.interactor.id,
//   message:
//     `Yiiiiiit Your welcome message for this channel was successfully created! :white_check_mark:`,
// });

export default MessageSetupWorkflow