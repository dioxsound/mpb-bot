import "dotenv/config";
import { Telegram } from "puregram";
import { HearManager } from "@puregram/hear";

import DatabaseManager from "./database_manager/database_manager.js";

import CommandsViewModel from "./commands/commands_viewmodel.js";

import CasinoWheelModel from "./casino_wheel/casino_wheel_model.js";
import WheelTransactionModel from "./casino_wheel/wheel_transaction_model.js";
import BookmakerModel from "./bookmaker/bookmaker_model.js";

import UsernameChangeModel from "./username/username_change/username_change_model.js";
import UsernameSaleModel from "./username/username_sale/username_sale_model.js";
import UserProfileModel from "./user_profile/user_profile_model.js";
import UsernameListModel from "./username/username_list/username_list_model.js";

import BankProfileModel from "./bank/bank_profile/bank_profile_model.js";
import BankTransferModel from "./bank/bank_transfer/bank_transfer_model.js";

import LeaderboardBankModel from "./leaderstats/leaderboard_bank_model.js";

const telegram = Telegram.fromToken(process.env.BOT_TOKEN);
const hearManager = new HearManager();

telegram.updates.on("message", hearManager.middleware);
/*  Команды для инициализации бд
 *  Команды для инициализации бд
 */
hearManager.hear(/^!дроп/i, DatabaseManager.removeTables);
hearManager.hear(/^!инит/i, DatabaseManager.createTables);
/*  Команды для казино
 *  Команды для казино
 */
hearManager.hear(/^казино(?:\s+(.+))?$/i, CasinoWheelModel.handleCasinoCommand);
hearManager.hear(/^пополнить казино(?:\s+(.+))?$/i, WheelTransactionModel.handleDepositCommand);
hearManager.hear(/^вывести казино(?:\s+(.+))?$/i, WheelTransactionModel.handleWithdrawCommand);
hearManager.hear(/^букмекер(?:\s+(.+))?$/i, BookmakerModel.chooseBookmaker);
/*  Команды для просмотра профиля
 *  Команды для просмотра профиля
 */
hearManager.hear(/^никнейм(?:\s+(.+))?$/i, UsernameChangeModel.changeUsername);
hearManager.hear(/^продать никнейм(?:\s+(.+))?$/i, UsernameSaleModel.sellUsername);
hearManager.hear(/^купить никнейм(?:\s+(.+))?$/i, UsernameSaleModel.buyUsername);
hearManager.hear(/^отменить никнейм/i, UsernameSaleModel.cancelUsernameSale);
hearManager.hear(/^лоты никнейм/i, UsernameListModel.listSales);
hearManager.hear(/^профиль(?:\s+(.+))?$/i, UserProfileModel.viewUserProfile);
/*  Команды для банка
 *  Команды для банка
 */
hearManager.hear(/^банк(?:\s+(.+))?$/i, BankProfileModel.viewBankProfile);
hearManager.hear(/^перевести(?:\s+(.+))?$/i, BankTransferModel.transferMoney);
/*  Команды для просмотра команд
 *  Команды для просмотра команд
 */
hearManager.hear(/^команды/i, CommandsViewModel.showCommands);
hearManager.hear(/^топ банк/i, LeaderboardBankModel.sendTopPlayers);

telegram.updates.startPolling();
