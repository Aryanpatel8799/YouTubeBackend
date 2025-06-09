class ApiResponse{
    constructor(statusCode,msg="Success",data=null,success=true,stack=""){
        this.statusCode=statusCode;
        this.msg=msg;
        this.data=data;
        this.success=statusCode<400;
       
    }
}