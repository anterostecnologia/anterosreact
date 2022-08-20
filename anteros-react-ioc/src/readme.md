# @anterostecnologia/anteros-react-ioc

Esta biblioteca implementa a injeção de dependência para JavaScript e TypeScript.

## Features

- Sintaxe semelhante ao InversifyJS
- Pode ser usado sem decoradores
- Menos recursos, mas **straight forward**
- Pode vincular dependências como **classes**, **factories** e **static values**
- Suporta a ligação em **singleton scope**
- **Cached** - Resolve apenas uma vez em cada classe dependente por padrão
- **Cache can switched off** diretamente no decorador injetado
- Feito com **unit testing** em mente
- Suporta dependência **rebinding** e contêiner**snapshots** anderestores\*\*
- **Lightweight** - Abaixo de 1kb gzip compactado
- **NOT** precisa refletc-metadata, que o tamanho é de cerca de 50 kb
- 100% escrito em **Typescript**

## Instalar

```bash
npm install --save-dev @owja/ioc
```

Visualização mais recente/versão de dev (alfa ou beta)

```bash
npm install --save-dev @anterostecnologia/anteros-react-ioc
```

## A API do contêiner

### Criando um contêiner

O contêiner é o local onde todas as dependências são vinculadas.É possível ter
Contêiner múltiplo em nosso projeto em paralelo.

```ts
import { ContainerIoc } from "@anterostecnologia/anteros-react-ioc";
const container = new ContainerIoc();
```

### Vinculativo

#### Vinculando uma classe

Esta é a maneira padrão de vincular uma dependência. A classe será instanciada quando o
a dependência for resolvida.

```ts
container.bind<ServiceInterface>(symbol).to(Service);
```

#### Vinculando uma aula em escopo de singleton

Isso criará apenas uma instância de `Service`

```ts
container.bind<ServiceInterface>(symbol).to(Service).inSingletonScope();
```

#### Vincular uma fábrica

As fábricas são funções que serão chamadas quando a dependência for resolvida

```ts
container.bind<ServiceInterface>(symbol).toFactory(() => new Service());
container.bind<string>(symbol).toFactory(() => "just a string");
```

Uma fábrica também pode configurar o escopo de singleton. Dessa forma, só será executado uma vez.

```ts
container
  .bind<ServiceInterface>(symbol)
  .toFactory(() => new Service())
  .inSingletonScope();
```

#### Vincular um valor

É sempre como o escopo de singleton, mas deve ser evitado para instanciar
dependências aqui. Se forem dependências circulares, falharão.

```ts
container.bind<ServiceInterface>(symbol).toValue(new Service()); // Ruim, deve ser evitado
container.bind<string>(symbol).toValue("apenas uma corda");
container.bind<() => string>(symbol).toValue(() => "Eu sou uma função");
```

### Vincular novamente

É assim que podemos vincular novamente uma dependência enquanto **unit tests**. Não devemos precisar
vincular novamente o código em produção.

```ts
container.rebind<ServiceMock>(symbol).toValue(new ServiceMock());
```

### Removendo

Normalmente, essa função não é usada no código de produção. Isso removerá o
dependência do contêiner.

```ts
container.remove(symbol);
```

### Obtendo uma dependência

Obtendo dependências sem `@inject` decoradores `container.get()` só é feito para **unit tests**.
Esta também é a maneira interna de como o `@inject` decorador e as funções `wire()` e `resolve()` estão recebendo a dependência.

```ts
container.get<Interface>(symbol);
```

Para obter uma dependência sem `@inject` decorador em uso de código de produção `wire()` ou `resolve()`. Usando `container.get()`
diretamente para obter dependências pode resultar em loops infinitos com dependências circulares quando chamadas dentro de
construtores. Além disso `container.get()` não respeita o cache.

> **Nota importante:** Você deve evitar acessar as dependências de qualquer construtor. Com dependências circulares
> Isso pode resultar em um loop infinito.

### Snapshot e restauração

Isso cria um snapshot das dependências vinculadas. Depois disso, podemos vincular dependências
e pode restaurá-lo de volta ao seu antigo estado depois que fizermos alguns **unit tests**.

```ts
container.snapshot();
```

```ts
container.restore();
```

## O decorador `inject`

Para usar o decorador que você deve definir `experimentalDecorators` para `true`
na tua `tsconfig.json`.

Primeiro temos que criar um decorador `inject` para cada recipiente:

```ts
import { createDecorator } from "@anterostecnologia/anteros-react-ioc";
export const inject = createDecorator(container);
```

Em seguida, podemos usar o decorador para injetar a dependência.

```ts
class Example {
  @inject(symbol)
  readonly service!: Interface;

  method() {
    this.service.doSomething();
  }
}
```

## A função `wire()`

Se não queremos usar decoradores, podemos usar a função wire. Faz o mesmo que o decorador `inject`
e temos que criar a função primeiro como fazemos com `inject`.

```ts
import { createWire } from "@anterostecnologia/anteros-react-ioc";
export const wire = createWire(container);
```

Em seguida, podemos conectar o dependente para a dependência.

```ts
class Example {
  readonly service!: Interface;

  constructor() {
    wire(this, "service", symbol);
  }

  method() {
    this.service.doSomething();
  }
}
```

> Aviso: com a propriedade `wire()`, neste caso `service`, tem que ser público.

## A função `resolve()`

Uma segunda maneira de resolver uma dependência sem decoradores é usar `resolve()`.
Para usar `resolve()` temos que criar a função primeiro.

```ts
import { createResolve } from "@anterostecnologia/anteros-react-ioc";
export const resolve = createResolve(container);
```

Em seguida, podemos resolver a dependência nas classes e até funções.

```ts
class Example {
  private readonly service = resolve<Interface>(symbol);

  method() {
    this.service().doSomething();
  }
}
```

```ts
function Example() {
  const service = resolve<Interface>(symbol);
  service().doSomething();
}
```

> Aviso: acordamos a dependência por uma função.
> A dependência não é atribuída diretamente à propriedade/constante.
> Se queremos acesso direto, podemos usar `container.get()` Mas devemos evitar
> usando `get()` dentro das classes porque depois perdemos a dependência preguiçosa
> resolving/injection comportamento e cache.

## O `symbol`

Símbolos são usados para identificar nossas dependências. Uma boa prática é mantê-los em um só lugar.

```ts
export const TYPE = {
    "Service" = Symbol("Service"),
    // [...]
}
```

Símbolos podem ser definidos com `Symbol.for()` também. Dessa forma, eles não são únicos.
Lembrar `Symbol('foo') === Symbol('foo')` é `false` mas
`Symbol.for('foo') === Symbol.for('foo')` é `true`

```ts
export const TYPE = {
    "Service" = Symbol.for("Service"),
    // [...]
}
```

Type-Safe Token

Adicionamos a possibilidade de usar uma maneira segura para identificar nossas dependências. Isso é feito com tokens:

```ts
export TYPE = {
    "Service" = token<MyServiceInterface>("Service"),
    // [...]
}
```

Neste caso, o tipo `MyServiceInterface` é herdado ao usar `container.get(TYPE.Service)`, `resolve(TYPE.Service)`
e `wire(this, "service", TYPE.Service)`e não precisa ser adicionado explicitamente. Em caso de decorador `@inject(TYPE.Service)` precisa ser adicionado
mas lança um erro de tipo se os tipos não corresponderem:

```ts
class Example {
  @inject(TYPE.Service) // throws a type error because WrongInterface is not compatible with MyServiceInterface
  readonly service!: WrongInterface;
}
```

Correto:

```ts
class Example {
  @inject(TYPE.Service)
  readonly service!: MyServiceInterface;
}
```

## Plugins

Os plugins são uma maneira de conectar-se ao processo de resolução de dependência e executar código que pode acessar a dependência e também o objeto dependente.

Um plug-in pode ser adicionado diretamente a uma dependência ou ao contêiner.

```ts
container.bind(symbol).to(MyService).withPlugin(plugin);
```

```ts
container.addPlugin(plugin);
```

O plug-in é uma função simples que tem acesso à dependência, o destino (a instância que requer a dependência),
Os argumentos que são passados: o token ou o símbolo que representa a dependência e o contêiner.

```ts
type Plugin<Dependency = any, Target = any> = (
  dependency: Dependency,
  target: Target | undefined,
  args: symbol[],
  token: MaybeToken<Dependency>,
  container: Container
) => void;
```

### Exemplo de plug-in

O código a seguir é um plug -in que vincula um componente View a um serviço chamando forceUpdate sempre que o
O serviço executa o ouvinte:

```ts
import { Plugin } from "@anterostecnologia/anteros-react-ioc";
import { Component } from "react";

export const SUBSCRIBE = Symbol();

export const serviceListenerPlugin: Plugin<Listenable, Component> = (
  service,
  component,
  args
) => {
  if (args.indexOf(SUBSCRIBE) === -1 || !component) return;

  const unsubscribe = service.listen(() => component.forceUpdate());
  const unmount = component.componentWillUnmount;

  component.componentWillUnmount = () => {
    unsubscribe();
    unmount?.();
  };
};

interface Listenable {
  listen(listener: () => void): () => void;
}
```

> Nota: Isso falhará no tempo de execução se `service` não implementa o `Listenable` interface porque não há verificação de tipo feita

Este plugin é adicionado diretamente à dependência:

```ts
const TYPE = {
  TranslationService: token<TranslatorInterface>("translation-service"),
};

container
  .bind<TranslatorInterface>(TYPE.TranslationService)
  .toFactory(translationFactory)
  .inSingletonScope()
  .withPlugin(serviceListenerPlugin);
```

Em um componente, ele é executado quando a dependência é resolvida:

```ts
class Index extends Component {
  @inject(TYPE.TranslationService, SUBSCRIBE)
  readonly service!: TranslatorInterface;

  render() {
    return <div>{this.service.t("greeting")}</div>;
  }
}
```

Isso também funciona com `wire` e `resolve`:

```ts
class Index extends Component {
    readonly service!: TranslatorInterface;

    constructor() {
        super();
        wire(this, "service", TYPE.TranslationService, SUBSCRIBE);
    }

    [...]
}

class Index extends Component {
    readonly service = resolve(TYPE.TranslationService, SUBSCRIBE);

    [...]
}

```

### Impedir a execução dos plugins

Caso você adicione um plug-in, ele é executado toda vez que a dependência é resolvida. Se você quiser evitar isso, você pode
add the `NOPLUGINS` símbolo para os argumentos:

```ts
import { NOPLUGINS } from "@anterostecnologia/anteros-react-ioc";

class Example {
  @inject(TYPE.MyService, NOPLUGINS)
  readonly service!: MyServiceInterface;
}
```

## Começando

#### Etapa 1 - Instalando a biblioteca do IOC

```bash
npm install --save-dev @anterostecnologia/anteros-react-ioc
```

#### Etapa 2 - Criando símbolos para nossas dependências

Agora criamos a pasta **_services_** e adicione o novo arquivo **_services/types.ts_**:

```ts
export const TYPE = {
  MyService: Symbol("MyService"),
  MyOtherService: Symbol("MyOtherService"),
};
```

#### Etapa 3 - Exemplo de Serviços

Em seguida, criamos serviços de exemplo.

File **_services/my-service.ts_**

```ts
export interface MyServiceInterface {
  hello: string;
}

export class MyService implements MyServiceInterface {
  hello = "world";
}
```

File **_services/my-other-service.ts_**

```ts
export interface MyOtherServiceInterface {
  random: number;
}

export class MyOtherService implements MyOtherServiceInterface {
  random = Math.random();
}
```

#### Etapa 4 - Criando um contêiner

Em seguida, precisamos de um contêiner para vincular nossas dependências.Vamos criar o arquivo **_services/container.ts_**

```ts
import {
  ContainerIoc,
  createDecorator,
} from "@anterostecnologia/anteros-react-ioc";

import { TYPE } from "./types";

import { MyServiceInterface, MyService } from "./service/my-service";
import {
  MyOtherServiceInterface,
  MyOtherService,
} from "./service/my-other-service";

const container = new ContainerIoc();
const inject = createDecorator(container);

container.bind<MyServiceInterface>(TYPE.MyService).to(MyService);
container.bind<MyOtherServiceInterface>(TYPE.MyOtherService).to(MyOtherService);

export { container, TYPE, inject };
```

#### Etapa 5 - Injetando dependências

Vamos criar um **_example.ts_** Arquivo em nossa raiz de origem:

```ts
import { TYPE, inject } from "./service/container";
import { MyServiceInterface } from "./service/my-service";
import { MyOtherServiceInterface } from "./service/my-other-service";

class Example {
  @inject(TYPE.MyService)
  readonly myService!: MyServiceInterface;

  @inject(TYPE.MyOtherService)
  readonly myOtherService!: MyOtherServiceInterface;
}

const example = new Example();

console.log(example.myService);
console.log(example.myOtherService);
console.log(example.myOtherService);
```

Se executarmos este exemplo, devemos ver o conteúdo de nossos serviços de exemplo.

As dependências (serviços) serão injetadas na primeira chamada.Isso significa que se você rebide o serviço depois
Acessando as propriedades da classe de exemplo, ela não resolverá um novo serviço.Se você quer um novo
serviço cada vez que você liga `example.myService` você tem que adicionar o `NOCACHE` tag:

```ts
// [...]
import { NOCACHE } from "@anterostecnologia/anteros-react-ioc";

class Example {
  // [...]

  @inject(TYPE.MyOtherSerice, NOCACHE)
  readonly myOtherService!: MyOtherServiceInterface;
}

// [...]
```

Neste caso, os dois últimos `console.log()` As saídas devem mostrar números diferentes.

## Teste de unidade com COI

Para testes de unidade, primeiro criamos nossas manchas

**_test/my-service-mock.ts_**

```ts
import { MyServiceInterface } from "../service/my-service";

export class MyServiceMock implements MyServiceInterface {
  hello = "test";
}
```

**_test/my-other-service-mock.ts_**

```ts
import { MyOtherServiceInterface } from "../service/my-other-service";

export class MyOtherServiceMock implements MyOtherServiceInterface {
  random = 9;
}
```

Dentro dos testes, podemos instantâneos e restaurar um contêiner.
Também podemos fazer vários instantâneos seguidos.

File **_example.test.ts_**

```ts
import { container, TYPE } from "./service/container";
import { MyServiceInterface } from "./service/my-service";
import { MyOtherServiceInterface } from "./service/my-other-service";

import { MyServiceMock } from "./test/my-service-mock";
import { MyOtherServiceMock } from "./test/my-other-service-mock";

import { Example } from "./example";

describe("Example", () => {
  let example: Example;
  beforeEach(() => {
    container.snapshot();
    container.rebind<MyServiceInterface>(TYPE.MyService).to(MyServiceMock);
    container
      .rebind<MyOtherServiceInterface>(TYPE.MyOtherService)
      .to(MyOtherServiceMock);

    example = new Example();
  });

  afterEach(() => {
    container.restore();
  });

  test('should return "test"', () => {
    expect(example.myService.hello).toBe("test");
  });

  test('should return "9"', () => {
    expect(example.myOtherService.random).toBe(9);
  });
});
```
