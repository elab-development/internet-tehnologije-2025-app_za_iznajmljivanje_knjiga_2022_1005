'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Zaduzenje extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
   static associate(models) {
  // Zaduženje vezujemo za studenta
  Zaduzenje.belongsTo(models.Student, {
    foreignKey: 'studentId',
    as: 'student'
  });
  
  // Zaduženje vezujemo za publikaciju
  Zaduzenje.belongsTo(models.Publikacija, {
    foreignKey: 'publikacijaId',
    as: 'publikacija'
  });
}
  }
  Zaduzenje.init({
    datumZaduzenja: DataTypes.DATE,
    datumVracanja: DataTypes.DATE,
    status: DataTypes.STRING,
    studentId: DataTypes.INTEGER,
    publikacijaId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Zaduzenje',
  });
  return Zaduzenje;
};