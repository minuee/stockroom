import gql from 'graphql-tag';

export const getChatHistory = gql`
  query listChatMessages($input: ModelChatMessageInput) {
    data: listChatMessages(input: $input) {
      items {
        chat_room_no
        chat_message_no
        chat_message_type_code_id
        chat_message_content
        input_user_no
        input_admin_no
        create_at
        update_at
      }
      next_token
    }
  }
`;
