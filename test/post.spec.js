import chai from "chai";
import chaiHttp from "chai-http";
import tasksModel from "../models/task"
import { Context } from "mocha";

chai.use(chaiHttp);

const app = require("../app");
const request = chai.request.agent(app);
const expect = chai.expect;
const rabbit = chai.request("http://rabbitmq:15672") //conecta no rabbitmq para pegar as informações que serão enviadas por email

describe("post", () => {

    context("quando eu cadastro uma tarefa", () => {
        let task = { title: "Estudar Mongoose", owner: "eu@papito.io", done: false }

        before(done => {
            rabbit
                .delete("/api/queues/%2F/tasksdev/contents") //endereço para o purge
                .auth("guest", "guest")
                .end((err, res) => {
                    expect(res).to.has.status(204) //garante que tudo foi deletado, senão daria outro número
                    done() //todo esse before garante que o banco estará sem nenhuma tarefa quando este teste rodar (204 = sucesso sem conteúdo no body)
                })
        })

        it("então deve retornar 200", (done) => {
            request
                .post("/task")
                .send(task)
                .end((err, res) => {
                    expect(res).to.has.status(200)
                    expect(res.body.data.title).to.be.an("string")
                    expect(res.body.data.owner).to.be.an("string")
                    expect(res.body.data.done).to.be.an("boolean")

                    done()
                })
        })
        it("e deve enviar um email", (done) => {

            let payload = { vhost: "/", name: "tasksdev", truncate: "50000", ackmode: "ack_requeue_true", encoding: "auto", count: "1" }

            rabbit
                .post("/api/queues/%2F/tasksdev/get") //rota que contém as informações do email a ser enviado
                .auth("guest", "guest") //login e senha do rabbitmq
                .send(payload) //faz o envio do POST com o conteúdo do "let payload"
                .end((err, res) => {
                    expect(res).to.has.status(200) //confirma se tudo acima foi enviado corretamente
                    //console.log(res.body[0].payload) //só para confirmar o que tem no objeto payload (a mensagem do email enviado)
                    expect(res.body[0].payload).to.contain(`Tarefa ${task.title} criada com sucesso!`) //valida a mensagem enviada
                    done()
                })
            //todo esse it simula a busca pela informação no Postman, já não precisa do consumer ligado
        })
    })

    context("quando nao informo o titulo", () => {
        let task = { title: "", owner: "eu@papito.io", done: false }

        it("então deve retornar 400", (done) => {
            request
                .post("/task")
                .send(task)
                .end((err, res) => {
                    expect(res).to.has.status(400)
                    expect(res.body.errors.title.properties.message).to.eql("Oops! Title is required.")
                    done()
                })
        })
    })

    context("quando nao informo o dono", () => {
        let task = { title: "Nova tarefa", owner: "", done: false }

        it("então deve retornar 400", (done) => {
            request
                .post("/task")
                .send(task)
                .end((err, res) => {
                    expect(res).to.has.status(400)
                    expect(res.body.errors.owner.properties.message).to.eql("Oops! Owner is required.")
                    done()
                })
        })
    })

    context("quando a tarefa ja existe", () => {
        let task = { title: "Planejar viagem para a China", owner: "eu@papito.io", done: false } //cria uma massa de testes para garantir que ao reenviar, esta ja exista.

        before((done) => {
            request
                .post("/task")
                .send(task) //envia a massa
                .end((err, res) => {
                    //expect(res).to.has.status(200) 
                    done()
                })
        })

        it("deve retornar 409", (done) => {
            request
                .post("/task")
                .send(task) //reenvia a massa de dados
                .end((err, res) => {
                    expect(res.status).to.be.eql(409) //confirma que massa ja existe validando pelo numero do erro, ja que a msg está diferente da aula
                    done()
                })
        })
    })
})
