import { Sequelize } from "sequelize";

const sequelize = new Sequelize("nextschema", "root", "newapp", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
});
export default sequelize;
