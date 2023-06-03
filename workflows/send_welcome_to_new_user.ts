import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 */
export const SendWelcomeToNewUser = DefineWorkflow({
  callback_id: "sendwelcometonewuser_workflow",
  title: "Do something when new user joins",
  description: "Do something when new user joins",
  input_parameters: {
    properties: {
      channelIdFun: {
        type: Schema.slack.types.channel_id,
      },
      triggeredUserId: {
        type: Schema.slack.types.user_id,
      },
      messageToSend: {
        type: Schema.types.string,
      },
    },
    required: ["channelIdFun", "triggeredUserId", "messageToSend"],
  },
});


SendWelcomeToNewUser.addStep(Schema.slack.functions.SendMessage, {
  channel_id: SendWelcomeToNewUser.inputs.channelIdFun,
  message: SendWelcomeToNewUser.inputs.messageToSend,
});

export default SendWelcomeToNewUser;
