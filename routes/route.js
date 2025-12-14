const express=require("express");
const router=express.Router();

const {register}=require("../controllers/signup");
const {login}=require("../controllers/login");
const {getProfile}=require("../controllers/profile");
const {createLedger,getUserLedgers,getLedgerDetails}=require("../controllers/createLedger");
const {addExpense,getLedgerTransactions}=require("../controllers/expence");
const {getDashboardStats}=require("../controllers/dashboard");
const { getLedgerActivity } = require("../controllers/activity/getLedgerActivity");



router.get("/dashboard/stats", getDashboardStats);
router.post("/register", register);
router.post("/login", login);

router.get("/profile", getProfile);


router.post("/createledger", createLedger);
router.get("/userledgers/:user_id", getUserLedgers);
router.get("/ledger/:ledger_id/:user_id/details", getLedgerDetails);

router.post("/addexpense",addExpense);
router.get("/ledger/:ledgerId/transactions",getLedgerTransactions);

router.get("/activity/ledger/:ledger_id", getLedgerActivity);
module.exports=router;