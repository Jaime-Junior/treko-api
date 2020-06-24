import chai from "chai";
import chaiHttp from "chai-http";
import tasksModel from "../models/task"
import { Context } from "mocha";

chai.use(chaiHttp);

const app = require("../app");
const request = chai.request.agent(app);
const expect = chai.expect;

describe("put", () => {
    context("quando eu altero uma tarefa", () => {

        let task = {
            _id: require("mongoose").Types.ObjectId(), //cria a massa de testes com um ID pré-definido
            title: "Comprar fandangos",
            owner: "eu@papito.io",
            done: false

        }

        before((done) => {
            tasksModel.insertMany([task]) //insere a tarefa (chamada task) no banco de dados
            done()
        })
        //put localhost:3000/task/id

        it("então deve retornar 200", (done) => {
            task.title = "comprar baconzitos", //atualizando dado
                task.done = true //atualizando dado
            request
                .put("/task/" + task._id) //endereço onde o PUT será feito
                .send(task) //envia a tarefa
                .end((err, res) => {
                    expect(res).to.have.status(200)
                    expect(res.body).to.eql({}) //a API está programada para retornar um objeto vazio, portanto este teste valida isso
                    done()
                })
        })
        it("e deve retornar os dados atualizados", (done) => {
            request
                .get("/task/" + task._id) //endereço onde o GET será feito
                .end((err, res) => {
                    expect(res).to.have.status(200)
                    expect(res.body.data.title).to.eql(task.title) //a API está programada para retornar um objeto vazio, portanto este teste valida isso
                    expect(res.body.data.done).to.be.true
                    done()
                })
        })
    })
})
