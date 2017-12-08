export function AnterosError(message){
    this.message = message;
    this.name = "AnterosError";
}

export function AnterosDatasourceError(message){
    this.message = message;
    this.name = "AnterosDatasourceError";
}