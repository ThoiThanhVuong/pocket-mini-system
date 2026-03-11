import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from "../base.entity";
import { ChatThreadEntity } from "./chat-thread.entity";
import { User } from "../iam/user.entity";

@Entity({ name: 'chat_messages' })
export class ChatMessageEntity extends BaseEntity {
    @Column({ name: 'thread_id', nullable: true })
    threadId: string;

    @Column({ name: 'user_id', nullable: true })
    userId: string;

    @Column()
    role: string;

    @Column()
    content: string;

    @ManyToOne(() => ChatThreadEntity)
    @JoinColumn({ name: 'thread_id' })
    thread: ChatThreadEntity;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
