import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import Whatsapp from "../../models/Whatsapp";
import Company from "../../models/Company";
const ShowTicketService = async (
  id: string | number,
  //: number,
  companyId: number
): Promise<Ticket> => {
  const ticket = await Ticket.findOne({
    where: { id },
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: [
          "id",
          "name",
          "chatId",
          "number",
          "email",
          "profilePicUrl",
          "acceptAudioMessage",
          "active",
          "disableBot"
        ],
        include: ["extraInfo"]
      },
      { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
      { model: User, as: "user", attributes: ["id", "name"] },
      { model: Tag, as: "tags", attributes: ["id", "name", "color"] },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["name", "facebookUserToken", "facebookUserId"]
      },
      { model: Company, as: "company", attributes: ["name"] }
    ]
  });
  if (ticket?.companyId !== companyId) {
    throw new AppError("Não é possível consultar registros de outra empresa");
  }
  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }
  return ticket;
};
export default ShowTicketService;
