import { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { useSession, useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react";
import { ChatGPTService } from "./ChatGPTService";
import { CalendarService } from "./CalendarService";
import { DATE_PROMPT, PROMPT_HABLAR, TIME_PROMPT, PHONE_PROMPT } from '../constants/prompts';
import { config } from '../config/env.config';

export const imports = {
  useState,
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  useSession,
  useSupabaseClient,
  useSessionContext,
  ChatGPTService,
  CalendarService,
  DATE_PROMPT,
  PROMPT_HABLAR,
  TIME_PROMPT,
  PHONE_PROMPT,

  config
};