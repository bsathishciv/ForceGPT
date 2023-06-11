/**
 * JSForce command and argument parser from LLM results
 * @author Sathish Balaji <bsathish.civ@gmail.com>
 */

class InvalidJSFCommand extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidJSFCommand";
    }
}

class JSFConvertor {

    conn;
    
    constructor(conn) {
        this.conn = conn;
    }

    convert(task) {
        const resObj = {};
        if (this.commandExists(task.command)) {
            const parts = task.command.split('.');
            resObj.type = parts[0];
            resObj.command = this.getCommand(parts);
            resObj.argsArray = this.getArgs(resObj.type, parts.length > 2 ? parts[1] : resObj.command, task.args);
        }
        return resObj;
    }

    getCommand(parts=[]) {
        if (parts && parts.length) {
            if (parts.length == 2) {
                return parts[1];
            } else if (parts.length == 1) {
                return parts[0];
            } else if (parts.length > 2) {
                const x = JSON.parse(JSON.stringify(parts));
                x.shift();
                return x.join('.');
            }
        }
        return parts[0]
    }

    getArgs(type, command, args) {
        console.log(type, command, args);
        let argsArray = [];
        switch (type) {
            case 'metadata':
                switch (command) {
                    case 'update':
                        argsArray.push(args.type, args.metadata);
                        break;
                    case 'list':
                        argsArray.push(args.types, args.version);
                        break;
                    case 'read':
                        argsArray.push(args.type, args.fullNames);
                        break;
                    default:
                        break;
                }
                break;
            case 'query':
                argsArray.push(args.query);
            case 'describe':
                argsArray.push(args.name);
            case 'tooling':
                switch (command) {
                    case 'delete':
                        argsArray.push(args.type, args.id);
                        break;
                    case 'query':
                        argsArray.push(args.query);
                        break;
                    case 'executeAnonymous':
                        argsArray.push(args.apex);
                        break;
                    case 'sobject':
                        argsArray.push(args.obj);
                        break;
                    default:
                        break;
                }
            case 'sobject':
                argsArray.push(args.id);
                        break;

            default:
                break;
        }
        argsArray = argsArray.filter(element => element !== undefined);
        return argsArray;
    }



    commandExists(command) {
        if (command) {
            const parts = command.split('.');
            if (parts.length == 2) {
                if (Object.getOwnPropertyNames(this.conn).includes(parts[0])) {
                    if (this.isFunctionArgument(this.conn[parts[0]], parts[1])) {
                        return true;
                    }
                }
            } else {
                //if (Object.getOwnPropertyNames(this.conn).includes(parts[0])) {
                    return true;
                //}
            }
        }
        throw new InvalidJSFCommand(`Command ${command} does not exist in jsForce`)
    }

    isFunctionArgument(obj, propertyName) {
        return typeof obj[propertyName] === 'function';
    }

}

module.exports = {
    JSFConvertor,
    InvalidJSFCommand
}