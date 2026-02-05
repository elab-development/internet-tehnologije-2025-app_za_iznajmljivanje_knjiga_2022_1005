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
  freezeTableName: true,   
  tableName: 'Zaduzenjes',  
  timestamps: false 
  });
  return Zaduzenje;
};