const fs = require('fs');
const path = require('path');

class StudentData{
    /**
     * 
     * @param {string} 学生姓名
     * @param {string} 学生学号
     * @param {string} 学生性别
     * @param {number} 查询指定年份数据
     */
    constructor(name,stu_id,gender,year){
        this.name = name;
        this.stu_id = stu_id;
        this.gender = gender;
        this.year = year;
        this.cache_origin_data = {};
        this.cache_data = {};
    }
    async _getRemoteData(){
        //...todo
    }

    async getFullData(){
        //...todo
    }

    //...todo
}

class GradeData{
    /**
     * @param {string} 年级
     */
    constructor(grade_id){
        this.grade_id = grade_id
    }

    async _getRemoteData(){
        //...todo
    }

    async getFullData(){
        //...todo
    }

    //...todo
}

//...todo
module.exports = {StudentData, GradeData};
