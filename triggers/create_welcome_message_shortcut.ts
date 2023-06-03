import { Trigger } from "deno-slack-api/types.ts";
import MessageSetupWorkflow from "../workflows/create_welcome_message.ts";

const welcomeMessageTrigger: Trigger<typeof MessageSetupWorkflow.definition> = {
  type: "shortcut",
  name: "Setup a Welcome Message",
  description: "Creates an automated welcome message for a given channel.",
  workflow: "#/workflows/message_setup_workflowddd",
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
    channel: {
      value: "{{data.channel_id}}",
    },
  },
};

export default welcomeMessageTrigger;