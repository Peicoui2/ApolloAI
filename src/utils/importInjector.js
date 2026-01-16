import { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { useSession, useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react";
import { ChatGPTService } from "../services/ChatGPTService";
import { CalendarServiceActiveUser } from "../services/CalendarServiceActiveUser";
import { CalendarServiceAccount} from "../services/CalendarService";
import { DATE_PROMPT, SPEAK_PROMPT, TIME_PROMPT, PHONE_PROMPT } from './prompts';
import { config } from '../config/env.config';

export const imports = {
  useState,
  MainContainer,
  ChatContainer,
  MessageList,
  MessageInput,
  TypingIndicator,
  useSession,
  useSupabaseClient,
  useSessionContext,
  ChatGPTService,
  CalendarServiceActiveUser,
  CalendarServiceAccount,
  DATE_PROMPT,
  SPEAK_PROMPT,
  TIME_PROMPT,
  PHONE_PROMPT,

  config
};