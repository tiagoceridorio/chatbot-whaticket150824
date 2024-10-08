import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import Whatsapp from "../models/Whatsapp";
import Ticket from "../models/Ticket";
import User from "../models/User";
import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import ShowTicketUUIDService from "../services/TicketServices/ShowTicketFromUUIDService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import ListTicketsServiceKanban from "../services/TicketServices/ListTicketsServiceKanban";
type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  status: string;
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  updatedAt?: string;
  showAll: string;
  withUnreadMessages?: string;
  queueIds?: string;
  tags?: string;
  users?: string;
  isGroup?: string;
};
interface TicketData {
  contactId: number;
  status: string;
  queueId: number;
  whatsappId: string;
  userId: number;
  sendFarewellMessage?: boolean;
}
export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    dateStart,
    dateEnd,
    updatedAt,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    tags: tagIdsStringified,
    users: userIdsStringified,
    withUnreadMessages,
    isGroup
  } = req.query as IndexQuery;
  const userId = req.user.id;
  const { companyId } = req.user;
  let queueIds: number[] = [];
  let tagsIds: number[] = [];
  let usersIds: number[] = [];
  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }
  if (tagIdsStringified) {
    tagsIds = JSON.parse(tagIdsStringified);
  }
  if (userIdsStringified) {
    usersIds = JSON.parse(userIdsStringified);
  }
  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    tags: tagsIds,
    users: usersIds,
    pageNumber,
    status,
    date,
    dateStart,
    dateEnd,
    updatedAt,
    showAll,
    userId,
    queueIds,
    withUnreadMessages,
    isGroup,
    companyId
  });
  return res.status(200).json({ tickets, count, hasMore });
};
export const kanban = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    updatedAt,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    tags: tagIdsStringified,
    users: userIdsStringified,
    withUnreadMessages
  } = req.query as IndexQuery;
  const userId = req.user.id;
  const { companyId } = req.user;
  let queueIds: number[] = [];
  let tagsIds: number[] = [];
  let usersIds: number[] = [];
  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }
  if (tagIdsStringified) {
    tagsIds = JSON.parse(tagIdsStringified);
  }
  if (userIdsStringified) {
    usersIds = JSON.parse(userIdsStringified);
  }
  console.log("withUnreadMessages");
  console.log(withUnreadMessages);
  const { tickets, count, hasMore } = await ListTicketsServiceKanban({
    searchParam,
    tags: tagsIds,
    users: usersIds,
    pageNumber,
    status,
    date,
    updatedAt,
    showAll,
    userId,
    queueIds,
    withUnreadMessages,
    companyId
  });
  return res.status(200).json({ tickets, count, hasMore });
};
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status, userId, queueId, whatsappId }: TicketData = req.body;
  const { companyId, id } = req.user;

  const ticketCount = await Ticket.count({ where: { userId: id, status: "open", companyId } });
  //const { limitAttendance, name } = await User.findByPk(id);



  /*if (ticketCount >= limitAttendance) {
   // throw new AppError(`Número máximo de atendimentos atingido para o usuario ${name}, encerre um atendimento para criar um novo.`, 400);
  }*/

  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    companyId,
    queueId,
    whatsappId
  });

  const io = getIO();
  io.to(`company-${ticket.companyId}-${ticket.status}`)
    .to(`queue-${ticket.queueId}-${ticket.status}`)
    .emit(`company-${companyId}-ticket`, {
    action: "update",
    ticket
  });
  return res.status(200).json(ticket);
};
export const criar = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status, userId, queueId, }: TicketData = req.body;
  const { companyId } = req.user;
  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    companyId,
    queueId
  });
  const io = getIO();
  io.to(ticket.status).emit(`company-${companyId}-ticket`, {
    action: "update",
    ticket
  });
  return res.status(200).json(ticket);
};
export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;
  const contact = await ShowTicketService(ticketId, companyId);
  return res.status(200).json(contact);
};
export const showFromUUID = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { uuid } = req.params;
  const ticket: Ticket = await ShowTicketUUIDService(uuid);
  return res.status(200).json(ticket);
};
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const ticketData: TicketData = req.body;
  const { companyId } = req.user;
  const { ticket } = await UpdateTicketService({
    ticketData,
    ticketId,
    companyId,
    ratingId: undefined
  });
  return res.status(200).json(ticket);
};
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;
  await ShowTicketService(ticketId, companyId);
  const ticket = await DeleteTicketService(ticketId);
  const io = getIO();
  io.to(ticket.status)
    .to(ticketId)
    .to("notification")
    .emit(`company-${companyId}-ticket`, {
      action: "delete",
      ticketId: +ticketId
    });
  return res.status(200).json({ message: "ticket deleted" });
};


