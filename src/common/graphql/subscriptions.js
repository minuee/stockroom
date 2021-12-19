import gql from 'graphql-tag';

export const onCreateChatMessage = gql`
  subscription onCreateChatMessage($chat_room_no: Int!) {
    data: onCreateChatMessage(chat_room_no: $chat_room_no) {
      chat_room_no
      chat_message_no
      chat_message_type_code_id
      chat_message_content
      input_user_no
      input_admin_no
      create_at
    }
  }
`;

export const onCreateStockHistory = gql`
  subscription onCreateStockHistory($stock_code_no: Int!) {
    data: onCreateStockHistory(stock_code_no: $stock_code_no) {
      stock_code_no
      stock_history_no
      stock_history_type_code_id
      stock_history_content
      # stock_history_content_jsonb
      create_at
      update_at
    }
  }
`;
