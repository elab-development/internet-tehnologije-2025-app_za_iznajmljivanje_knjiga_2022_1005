'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Zaduzenje extends Model {
   
   static associate(models) {
 
  Zaduzenje.belongsTo(models.Student, {
    foreignKey: 'studentId',
    as: 'student'
  });
  
 
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
    tableName: 'zaduzenjes', 
    timestamps: false,
    freezeTableName: true   
  });
  return Zaduzenje;
};