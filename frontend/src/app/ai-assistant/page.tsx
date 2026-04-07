"use client";

import React, { Component } from 'react';
import { aiAssistantService } from '@/services/system/ai-assistant.service';
import { AiMessage, AiAssistantState, SuggestionChipProps } from '@/types/system/ai-assistant.types';
import { motion } from 'framer-motion';
import {
  Send,
  User,
  Bot,
  Lightbulb,
  ChevronRight,
  Trash2,
  MessageSquare,
  MoreVertical,
  Plus } from
'lucide-react';
import { toast } from 'sonner';


export default class AiAssistantPage extends Component<{}, AiAssistantState> {
  private messagesEndRef: React.RefObject<HTMLDivElement | null>;
  private typingTimeout: NodeJS.Timeout | null = null;
  private getGreetingMessage(): AiMessage {
    return {
      id: 'greeting',
      content: "Dạ em đây sếp! Sếp cần tính kho, phân tích doanh thu hay tư vấn chiến lược thì cứ giao cho em nhé.",
      sender: 'assistant',
      timestamp: new Date()
    };
  }

  constructor(props: {}) {
    super(props);
    this.state = {
      messages: [this.getGreetingMessage()],
      input: '',
      isTyping: false,
      threads: [],
      currentThreadId: null
    };
    this.messagesEndRef = React.createRef();
  }
  async componentDidMount() {
    this.scrollToBottom();
    await this.loadThreads();
  }

  loadThreads = async () => {
    try {
      const threads = await aiAssistantService.getThreads();
      this.setState({ threads });
      
      // Mặc định load thread gần nhất nếu chưa chọn gì
      if (threads.length > 0 && !this.state.currentThreadId) {
        this.handleSelectThread(threads[0].id);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
    }
  };

  handleSelectThread = async (threadId: string) => {
    this.setState({ currentThreadId: threadId, messages: [], isTyping: true });
    try {
      const historyData = await aiAssistantService.getHistory(threadId);
      if (historyData && historyData.length > 0) {
        const historyMessages: AiMessage[] = historyData.map((m: any, idx: number) => ({
          id: `hist-${idx}-${Date.now()}`,
          content: m.content,
          sender: m.role as 'user' | 'assistant',
          timestamp: new Date(m.createdAt)
        }));
        this.setState({ messages: historyMessages, isTyping: false });
      } else {
        this.setState({ messages: [this.getGreetingMessage()], isTyping: false });
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      this.setState({ isTyping: false });
    }
  };

  handleNewChat = () => {
    this.setState({
      currentThreadId: null,
      messages: [this.getGreetingMessage()],
      input: '',
      isTyping: false
    });
  };

  handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    try {
      const success = await aiAssistantService.deleteThread(threadId);
      if (success) {
        toast.success("Đã xóa đoạn chat");
        const threads = await aiAssistantService.getThreads();
        this.setState({ threads });
        
        if (this.state.currentThreadId === threadId) {
          this.handleNewChat();
        }
      } else {
        toast.error("Không thể xóa đoạn chat");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa.");
    }
  };

  componentDidUpdate() {

    this.scrollToBottom();
  }
  scrollToBottom = () => {
    this.messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      input: e.target.value
    });
  };
  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { input, messages } = this.state;
    if (!input.trim()) return;
    // Add user message
    const userMessage: AiMessage = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    this.setState({
      messages: [...messages, userMessage],
      input: '',
      isTyping: true
    });
    
    // Call Backend API via Service
    try {
      const responseMessage = await aiAssistantService.chat(input, this.state.currentThreadId || undefined);
      
      const wasNewChat = !this.state.currentThreadId;

      const aiMessage: AiMessage = {
        id: (Date.now() + 1).toString(),
        content: responseMessage || 'Lỗi: Không nhận được phản hồi',
        sender: 'assistant',
        timestamp: new Date()
      };
      
      this.setState((prevState) => ({
        messages: [...prevState.messages, aiMessage],
        isTyping: false
      }), async () => {
         if (wasNewChat) {
             const threads = await aiAssistantService.getThreads();
             this.setState({ threads });
             if (threads.length > 0) {
                 this.setState({ currentThreadId: threads[0].id });
             }
         }
      });
    } catch (error) {
      console.error('Lỗi khi gọi AI API:', error);
      const errorMessage: AiMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Xin lỗi, tôi đã gặp sự cố khi kết nối tới hệ thống máy chủ.',
        sender: 'assistant',
        timestamp: new Date()
      };
      this.setState((prevState) => ({
        messages: [...prevState.messages, errorMessage],
        isTyping: false
      }));
    }
  };

  componentWillUnmount() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  // removed handleClearChat as it is now handleNewChat / handleDeleteThread

  render() {
    const { messages, input, isTyping, threads, currentThreadId } = this.state;
    return (
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              AI Assistant
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Chuyên gia phân tích và trợ lý toàn năng
            </p>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* SIDEBAR LỊCH SỬ CHAT */}
          <div className="lg:col-span-1 flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <button
                onClick={this.handleNewChat}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm text-sm font-medium"
              >
                <Plus size={16} />
                <span>Tạo Chat Mới</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Các đoạn chat của bạn</h3>
              {threads.length === 0 ? (
                <p className="text-sm text-gray-500 px-2">Không có lịch sử</p>
              ) : (
                <div className="space-y-1">
                  {threads.map(thread => (
                    <div 
                      key={thread.id}
                      onClick={() => this.handleSelectThread(thread.id)}
                      className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${currentThreadId === thread.id ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <MessageSquare size={14} className="text-gray-400 min-w-max" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate" title={thread.title}>{thread.title || 'Đoạn chat chưa có tên'}</span>
                      </div>
                      <button 
                         onClick={(e) => this.handleDeleteThread(e, thread.id)}
                         className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                         title="Xóa đoạn chat này"
                      >
                         <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CHAT AREA */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[600px]">

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">

                  {messages.map((message, index) =>
                  <motion.div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{
                      opacity: 0,
                      x: message.sender === 'user' ? 20 : -20
                    }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    transition={{
                      duration: 0.3,
                      delay: 0.1
                    }}>

                      <div
                      className={`flex items-start max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>

                        <div
                        className={`flex-shrink-0 rounded-full w-8 h-8 flex items-center justify-center ${message.sender === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ml-2' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 mr-2'}`}>

                          {message.sender === 'user' ?
                        <User size={16} /> :

                        <Bot size={16} />
                        }
                        </div>
                        <div
                        className={`p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'}`}>

                          <p>{message.content}</p>
                          <p
                          className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>

                            {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {isTyping &&
                  <motion.div
                    className="flex justify-start"
                    initial={{
                      opacity: 0
                    }}
                    animate={{
                      opacity: 1
                    }}>

                      <div className="flex items-start max-w-[80%]">
                        <div className="flex-shrink-0 rounded-full w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 mr-2">
                          <Bot size={16} />
                        </div>
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <div className="flex space-x-1">
                            <motion.div
                            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"
                            animate={{
                              y: [0, -5, 0]
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              repeatDelay: 0.1
                            }} />

                            <motion.div
                            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"
                            animate={{
                              y: [0, -5, 0]
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              repeatDelay: 0.2,
                              delay: 0.1
                            }} />

                            <motion.div
                            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"
                            animate={{
                              y: [0, -5, 0]
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              repeatDelay: 0.3,
                              delay: 0.2
                            }} />

                          </div>
                        </div>
                      </div>
                    </motion.div>
                  }
                  <div ref={this.messagesEndRef} />
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <form onSubmit={this.handleSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ask something..."
                    value={input}
                    onChange={this.handleInputChange} />

                  <motion.button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded-md"
                    whileHover={{
                      scale: 1.05
                    }}
                    whileTap={{
                      scale: 0.95
                    }}
                    disabled={!input.trim()}>

                    <Send size={20} />
                  </motion.button>
                </form>
                <div className="mt-3 flex space-x-2 overflow-x-auto pb-2">
                  <SuggestionChip text="How are my sales this month?" />
                  <SuggestionChip text="Check inventory levels" />
                  <SuggestionChip text="Customer retention stats" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>);


  }
}
class SuggestionChip extends Component<SuggestionChipProps> {
  render() {
    const { text } = this.props;
    return (
      <motion.button
        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full whitespace-nowrap"
        whileHover={{
          scale: 1.05,
          backgroundColor: '#e0e7ff'
        }}
        whileTap={{
          scale: 0.95
        }}>

        {text}
      </motion.button>);

  }
}
