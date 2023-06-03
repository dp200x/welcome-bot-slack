import { Manifest } from "deno-slack-sdk/mod.ts";
import {MessageSetupWorkflow} from "./workflows/create_welcome_message.ts";
import { WelcomeMessageDatastore } from "./datastores/messages.ts";
import { SendWelcomeToNewUser } from "./workflows/send_welcome_to_new_user.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "Channel Welcome Bot",
  description:
    "Quick and easy way to setup automated welcome messages for channels in your workspace.",
  icon: "assets/default_new_app_icon.png",
  workflows: [MessageSetupWorkflow, SendWelcomeToNewUser],
  outgoingDomains: [],
  datastores: [WelcomeMessageDatastore],
  botScopes: [
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "channels:read",
    "triggers:write",
    "triggers:read",
  ],
});
