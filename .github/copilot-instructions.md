# NexCondo - Instruções do Projeto

## Objetivo

Desenvolver o back-end de um sistema de gerenciamento de condomínios, com foco em código limpo, organização, segurança e escalabilidade.

## Stack

Utilize obrigatoriamente:

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL (Neon)
- JWT
- Bcrypt

## Arquitetura

O projeto utiliza a arquitetura MVC.

As responsabilidades devem ser separadas da seguinte forma:

- Controllers: recebem a requisição, chamam os Services e retornam a resposta.
- Services: concentram toda a regra de negócio.
- Routes: definem as rotas da API.
- Middlewares: autenticação, autorização e tratamento de erros.
- Prisma: acesso ao banco de dados.

Nunca coloque regras de negócio nos Controllers.

## Padrões de código

Sempre seguir:

- SOLID
- Clean Code
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple)
- Tipagem forte com TypeScript
- async/await
- Tratamento global de erros
- Código reutilizável e de fácil manutenção

Sempre utilize nomes claros para arquivos, classes, funções e variáveis.

## Banco de Dados

Utilize Prisma ORM com PostgreSQL (Neon).

Antes de criar novas tabelas ou relações, analise a modelagem existente para evitar redundâncias.

## Autenticação

O sistema deve possuir:

- Cadastro
- Login
- Recuperação de senha
- Redefinição de senha
- JWT
- Hash de senha utilizando Bcrypt

Nunca armazene senhas em texto puro.

## Controle de acesso

Existem três perfis:

- Administrador
- Funcionário
- Morador

Sempre validar permissões antes de executar ações protegidas.

## Funcionalidades

O sistema possuirá os seguintes módulos:

- Autenticação
- Usuários
- Reserva de áreas comuns
- Mural de avisos
- Controle de encomendas

Cada módulo deve ser independente e organizado.

## Boas práticas

Sempre reutilize código existente antes de criar novos arquivos.

Evite duplicação de lógica.

Antes de implementar uma funcionalidade, analise toda a estrutura atual do projeto.

Sempre explique as alterações realizadas.

Caso uma implementação possa impactar outros módulos, informe isso antes de modificar o código.

Sempre respeite a arquitetura existente do projeto.

## Respostas

Quando eu solicitar uma nova funcionalidade:

1. Analise a estrutura atual.
2. Explique o que será feito.
3. Implemente apenas o que foi solicitado.
4. Não altere outros módulos sem necessidade.
5. Mantenha consistência com o restante do projeto.