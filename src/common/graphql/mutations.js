import gql from 'graphql-tag';

export const sendMessage = gql`
  mutation createChatMessage($input: ModelUpdateChatMessageInput!) {
    data: createChatMessage(input: $input) {
      chat_room_no
      chat_message_no
      chat_message_type_code_id
      chat_message_content
      input_user_no
      input_admin_no
      create_at
      update_at
    }
  }
`;
