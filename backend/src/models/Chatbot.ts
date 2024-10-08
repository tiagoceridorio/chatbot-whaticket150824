import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import Queue from "./Queue";
@Table
class Chatbot extends Model<Chatbot> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;
  @AllowNull(false)
  @Column
  name: string;
  @Column
  greetingMessage: string;
  @ForeignKey(() => Queue)
  @Column
  queueId: number;
  @BelongsTo(() => Queue)
  queue: Queue;
  @ForeignKey(() => Chatbot)
  @Column
  chatbotId: number;
  @AllowNull
  @Column
  optionType: string;
  @Column
  isAgent: boolean;
  @BelongsTo(() => Chatbot)
  mainChatbot: Chatbot;
  @HasMany(() => Chatbot)
  options: Chatbot[];
  @CreatedAt
  createdAt: Date;
  @UpdatedAt
  updatedAt: Date;
  option: string;
  message: any;
  title: any;
  parentId: any;
}
export default Chatbot;
