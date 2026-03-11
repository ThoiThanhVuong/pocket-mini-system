"use client";

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  User,
  Bot,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Lightbulb,
  ChevronRight } from
'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}
interface AiAssistantState {
  messages: Message[];
  input: string;
  isTyping: boolean;
}
export default class AiAssistantPage extends Component<{}, AiAssistantState> {
  private messagesEndRef: React.RefObject<HTMLDivElement | null>;
  private typingTimeout: NodeJS.Timeout | null = null;
  constructor(props: {}) {
    super(props);
    this.state = {
      messages: [
      {
        id: '1',
        content:
        "Hello! I'm your AI assistant. I can help you with inventory management, sales analysis, and business recommendations. How can I help you today?",
        sender: 'assistant',
        timestamp: new Date()
      }],

      input: '',
      isTyping: false
    };
    this.messagesEndRef = React.createRef();
  }
  componentDidMount() {
    this.scrollToBottom();
  }
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
  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { input, messages } = this.state;
    if (!input.trim()) return;
    // Add user message
    const userMessage: Message = {
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
    // Simulate AI response after a delay
    this.typingTimeout = setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: this.getAIResponse(input),
        sender: 'assistant',
        timestamp: new Date()
      };
      this.setState((prevState) => ({
        messages: [...prevState.messages, aiMessage],
        isTyping: false
      }));
    }, 1500);
  };
  componentWillUnmount() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }
  getAIResponse(input: string): string {
    // Simple response logic - in a real app this would call an API
    const inputLower = input.toLowerCase();
    if (inputLower.includes('inventory') || inputLower.includes('stock')) {
      return "Based on your current inventory levels, I've noticed that USB-C cables are running low. Consider reordering within the next week to avoid stockouts.";
    } else if (inputLower.includes('sales') || inputLower.includes('revenue')) {
      return 'Your sales have increased by 12% compared to last month. Your best-selling category is Electronics, with Wireless Headphones as the top product.';
    } else if (
    inputLower.includes('customer') ||
    inputLower.includes('clients'))
    {
      return "You've gained 48 new customers this month. Customer retention rate is at 68%, which is 5% higher than the previous quarter.";
    } else {
      return "I'm here to help with your business needs. You can ask me about inventory levels, sales performance, customer analytics, or for general business recommendations.";
    }
  }
  render() {
    const { messages, input, isTyping } = this.state;
    return (
      <div className="container mx-auto">
        <motion.div
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5
          }}
          className="mb-6">

          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            AI Assistant
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Get insights and recommendations for your business
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
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
          <div className="space-y-6">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.3,
                delay: 0.2
              }}>

              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                AI Recommendations
              </h3>
              <RecommendationCard
                icon={
                <TrendingUp
                  size={20}
                  className="text-green-600 dark:text-green-400" />

                }
                title="Sales Opportunity"
                content="Based on current trends, consider bundling Wireless Headphones with Phone Cases for increased sales."
                iconBg="bg-green-100 dark:bg-green-900/30" />

              <RecommendationCard
                icon={
                <AlertTriangle
                  size={20}
                  className="text-amber-600 dark:text-amber-400" />

                }
                title="Inventory Alert"
                content="USB-C Cables inventory is low. Consider reordering within the next 7 days."
                iconBg="bg-amber-100 dark:bg-amber-900/30" />

              <RecommendationCard
                icon={
                <RefreshCw
                  size={20}
                  className="text-blue-600 dark:text-blue-400" />

                }
                title="Process Optimization"
                content="Your order processing time has increased by 15%. Consider reviewing your workflow."
                iconBg="bg-blue-100 dark:bg-blue-900/30" />

            </motion.div>
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.3,
                delay: 0.4
              }}>

              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Business Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Customer Satisfaction
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                    92%
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-green-500 h-2 rounded-full"
                    initial={{
                      width: 0
                    }}
                    animate={{
                      width: '92%'
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.5
                    }} />

                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Inventory Turnover
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                    78%
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{
                      width: 0
                    }}
                    animate={{
                      width: '78%'
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.6
                    }} />

                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Order Fulfillment
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                    85%
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-purple-500 h-2 rounded-full"
                    initial={{
                      width: 0
                    }}
                    animate={{
                      width: '85%'
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.7
                    }} />

                </div>
              </div>
              <motion.button
                className="w-full mt-4 text-sm text-blue-600 dark:text-blue-400 flex items-center justify-center"
                whileHover={{
                  scale: 1.03
                }}>

                View Detailed Analytics{' '}
                <ChevronRight size={16} className="ml-1" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>);

  }
}
interface SuggestionChipProps {
  text: string;
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
interface RecommendationCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  iconBg: string;
}
class RecommendationCard extends Component<RecommendationCardProps> {
  render() {
    const { icon, title, content, iconBg } = this.props;
    return (
      <motion.div
        className="flex items-start mb-4 last:mb-0"
        whileHover={{
          x: 5
        }}>

        <div className={`${iconBg} p-2 rounded-full mr-3 flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{content}</p>
        </div>
      </motion.div>);

  }
}
