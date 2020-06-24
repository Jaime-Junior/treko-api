import chai from "chai";
import chaiHttp from "chai-http";
import tasksModel from "../models/task"

chai.use(chaiHttp);

const app = require("../app");
const request = chai.request.agent(app);
const expect = chai.expect;

describe("get", () => {

    context("quando eu tenho tarefas cadastradas", () => {

        before((done) => {
            let tasks = [
                { title: "estudar nodejs", owner: "eu@papito.io", done: false },
                { title: "fazer compras", owner: "eu@papito.io", done: false },
                { title: "estudar mongodb", owner: "eu@papito.io", done: true }
            ]
            tasksModel.insertMany(tasks);
            done();
        })

        it("deve retornar uma lista", (done) => {
            request
                .get("/task")
                .end((err, res) => {
                    expect(res).to.has.status(200); //confirmando o status code
                    expect(res.body.data).to.be.an('array'); //confirma se data é um array
                    done(); //teste em js é assincrono, então não finaliza se não chamar o done()
                })
        })

        it("deve filtrar por palavra chave", (done) => {
            request
                .get("/task")
                .query({ title: "estudar" })
                .end((err, res) => {
                    expect(res).to.has.status(200); //confirmando o status code
                    expect(res.body.data[0].title).to.equal('estudar nodejs'); //confirma se data possui no title "estudar nodejs"
                    expect(res.body.data[1].title).to.equal('estudar mongodb'); //confirma se data possui no title "estudar mongodb"
                    done(); //teste em js é assincrono, então não finaliza se não chamar o done()
                })
        })
    })

    context("quando busco por id", () => {

        it("deve retornar uma única tarefa", (done) => {
            let tasks = [
                { title: "ler um livro de javascript", owner: "eu@papito.io", done: false },
            ]
            tasksModel.insertMany(tasks, (err, result) => {
                let id = result[0]._id
                request
                    .get("/task/" + id)
                    .end((err, res) => {
                        expect(res).to.has.status(200);
                        expect(res.body.data.title).to.equal(tasks[0].title)
                        done();
                    })
            });
        })
    })

    context("quando a tarefa não existe", () => {

        it("deve retornar 404", (done) => {
            let id = require("mongoose").Types.ObjectId();
            request
            .get("/task/" + id)
            .end((err, res) => {
                expect(res).to.has.status(404);
                expect(res.body).to.eql({})
                done();
            })
        })
    })
})
