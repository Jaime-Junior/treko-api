import chai from "chai";
import chaiHttp from "chai-http";
import tasksModel from "../models/task"

chai.use(chaiHttp);

const app = require("../app");
const request = chai.request.agent(app);
const expect = chai.expect;

describe("delete", () => {

    context("quando apago uma tarefa", () => {
        let task = {
            _id: require("mongoose").Types.ObjectId(), //cria o ID
            title: "pagar conta de celular",
            owner: "eu@papito.io",
            done: false
        }
        before((done) => {
            tasksModel.insertMany([task]) //cria a tarefa
            done()
        })

        it("deve retornar 200", (done) => {
            request
            .delete("/task/" + task._id) //faz o DELETE na rota /task/:id
            .end((err,res) => {
                expect(res).to.have.status(200) //retorna 200 se deletado com sucesso
                expect(res.body).to.eql({})
                done()
            })
        })
        after((done) =>{
            request
            .get("/task/" + task._id) //faz o GET na rota /task/:id
            .end((err,res) => {
                expect(res).to.have.status(404) //retorna 404 se a tarefa nao existir (pois foi deletada)
                done()
            })
        })
    })

    context("quando a tarefa nao existe", () => {

        it("deve retornar 200", (done) => {
            let id = require("mongoose").Types.ObjectId //cria um id mas não envia tarefa (nao tem o before)
            request
            .delete("/task/" + id) //faz o DELETE na rota /task/:id
            .end((err,res) => {
                expect(res).to.have.status(404) //retorna 404 pois tentamos deletar uma tarefa de um ID que não existe (no banco de dados)
                expect(res.body).to.eql({})
                done()
            })
        })  
    })

})
