var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { merge, mergeWith, isArray, unescape, set, omit, flatMap, get, isString, isBoolean, pickBy, identity, isObject, isNumber } from "lodash";
import React, { useMemo, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import mjml from "mjml-browser";
var BasicType;
(function(BasicType2) {
  BasicType2["PAGE"] = "page";
  BasicType2["SECTION"] = "section";
  BasicType2["COLUMN"] = "column";
  BasicType2["GROUP"] = "group";
  BasicType2["TEXT"] = "text";
  BasicType2["IMAGE"] = "image";
  BasicType2["DIVIDER"] = "divider";
  BasicType2["SPACER"] = "spacer";
  BasicType2["BUTTON"] = "button";
  BasicType2["WRAPPER"] = "wrapper";
  BasicType2["RAW"] = "raw";
  BasicType2["ACCORDION"] = "accordion";
  BasicType2["ACCORDION_ELEMENT"] = "accordion-element";
  BasicType2["ACCORDION_TITLE"] = "accordion-title";
  BasicType2["ACCORDION_TEXT"] = "accordion-text";
  BasicType2["HERO"] = "hero";
  BasicType2["CAROUSEL"] = "carousel";
  BasicType2["NAVBAR"] = "navbar";
  BasicType2["SOCIAL"] = "social";
  BasicType2["TABLE"] = "table";
  BasicType2["TEMPLATE"] = "template";
})(BasicType || (BasicType = {}));
var AdvancedType;
(function(AdvancedType2) {
  AdvancedType2["TEXT"] = "advanced_text";
  AdvancedType2["IMAGE"] = "advanced_image";
  AdvancedType2["DIVIDER"] = "advanced_divider";
  AdvancedType2["SPACER"] = "advanced_spacer";
  AdvancedType2["BUTTON"] = "advanced_button";
  AdvancedType2["NAVBAR"] = "advanced_navbar";
  AdvancedType2["SOCIAL"] = "advanced_social";
  AdvancedType2["ACCORDION"] = "advanced_accordion";
  AdvancedType2["CAROUSEL"] = "advanced_carousel";
  AdvancedType2["WRAPPER"] = "advanced_wrapper";
  AdvancedType2["SECTION"] = "advanced_section";
  AdvancedType2["COLUMN"] = "advanced_column";
  AdvancedType2["GROUP"] = "advanced_group";
  AdvancedType2["HERO"] = "advanced_hero";
})(AdvancedType || (AdvancedType = {}));
const MERGE_TAG_CLASS_NAME = "anteros-email-merge-tag-container";
const EMAIL_BLOCK_CLASS_NAME = "email-block";
function createBlock(block) {
  return block;
}
const Wrapper$1 = createBlock({
  name: "Env\xF3lucro",
  type: BasicType.WRAPPER,
  create: (payload) => {
    const defaultData = {
      type: BasicType.WRAPPER,
      data: {
        value: {}
      },
      attributes: {
        padding: "20px 0px 20px 0px",
        border: "none",
        direction: "ltr",
        "text-align": "center"
      },
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.PAGE]
});
const Page$1 = createBlock({
  name: "P\xE1gina",
  type: BasicType.PAGE,
  create: (payload) => {
    const defaultData = {
      type: BasicType.PAGE,
      data: {
        value: {
          breakpoint: "480px",
          headAttributes: "",
          "font-size": "14px",
          "font-weight": "400",
          "line-height": "1.7",
          headStyles: [],
          fonts: [],
          responsive: true,
          "font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans','Helvetica Neue', sans-serif",
          "text-color": "#000000"
        }
      },
      attributes: {
        "background-color": "#efeeea",
        width: "600px"
      },
      children: [Wrapper$1.create()]
    };
    return merge(defaultData, payload);
  },
  validParentType: []
});
const Section$1 = createBlock({
  name: "Se\xE7\xE3o",
  type: BasicType.SECTION,
  create: (payload) => {
    const defaultData = {
      type: BasicType.SECTION,
      data: {
        value: {
          noWrap: false
        }
      },
      attributes: {
        padding: "20px 0px 20px 0px",
        "background-repeat": "repeat",
        "background-size": "auto",
        "background-position": "top center",
        border: "none",
        direction: "ltr",
        "text-align": "center"
      },
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.PAGE, BasicType.WRAPPER]
});
const Column$1 = createBlock({
  name: "Coluna",
  type: BasicType.COLUMN,
  create: (payload) => {
    const defaultData = {
      type: BasicType.COLUMN,
      data: {
        value: {}
      },
      attributes: {
        padding: "0px 0px 0px 0px",
        border: "none",
        "vertical-align": "top"
      },
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.SECTION, BasicType.GROUP]
});
const Text$1 = createBlock({
  name: "Texto",
  type: BasicType.TEXT,
  create: (payload) => {
    const defaultData = {
      type: BasicType.TEXT,
      data: {
        value: {
          content: "Facilite para todos escreverem e-mails!"
        }
      },
      attributes: {
        padding: "10px 25px 10px 25px",
        align: "left"
      },
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO]
});
const Image$1 = createBlock({
  name: "Imagem",
  type: BasicType.IMAGE,
  create: (payload) => {
    const defaultData = {
      type: BasicType.IMAGE,
      data: {
        value: {}
      },
      attributes: {
        align: "center",
        height: "auto",
        padding: "10px 25px 10px 25px",
        src: ""
      },
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO]
});
const Group$1 = createBlock({
  name: "Grupo",
  type: BasicType.GROUP,
  create: (payload) => {
    const defaultData = {
      type: BasicType.GROUP,
      data: {
        value: {}
      },
      attributes: {
        "vertical-align": "top",
        direction: "ltr"
      },
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.SECTION]
});
const Button$1 = createBlock({
  name: "Bot\xE3o",
  type: BasicType.BUTTON,
  create: (payload) => {
    const defaultData = {
      type: BasicType.BUTTON,
      data: {
        value: {
          content: "Button"
        }
      },
      attributes: {
        align: "center",
        "background-color": "#414141",
        color: "#ffffff",
        "font-weight": "normal",
        "border-radius": "3px",
        padding: "10px 25px 10px 25px",
        "inner-padding": "10px 25px 10px 25px",
        "line-height": "120%",
        target: "_blank",
        "vertical-align": "middle",
        border: "none",
        "text-align": "center",
        href: "#"
      },
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO]
});
const Divider$1 = createBlock({
  name: "Divisor",
  type: BasicType.DIVIDER,
  create: (payload) => {
    const defaultData = {
      type: BasicType.DIVIDER,
      data: {
        value: {}
      },
      attributes: {
        align: "center",
        "border-width": "1px",
        "border-style": "solid",
        "border-color": "#C9CCCF",
        padding: "10px 0px 10px 0px"
      },
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO]
});
const Spacer$1 = createBlock({
  name: "Espa\xE7amento",
  type: BasicType.SPACER,
  create: (payload) => {
    const defaultData = {
      type: BasicType.SPACER,
      data: {
        value: {}
      },
      attributes: {
        height: "20px"
      },
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO]
});
class ImageManager {
  static add(imgMap) {
    Object.keys(imgMap).forEach((name) => {
      if (this.map[name]) {
        this.overrideMap[name] = true;
      }
      this.map[name] = imgMap[name];
    });
  }
  static get(name) {
    return this.map[name];
  }
  static getOverrideMap() {
    return this.overrideMap;
  }
}
__publicField(ImageManager, "map", {});
__publicField(ImageManager, "overrideMap", {});
const defaultImagesMap = {
  IMAGE_01: "https://versatil-salescloud.relevantsolutions.com.br/images/ffddc3db-3aae-4d73-ac9c-e1263641f7b4-03c89c34-49a4-4d45-b289-4d2261158cbe.png",
  IMAGE_02: "https://versatil-salescloud.relevantsolutions.com.br/images/acbae5eb-efa4-4eb6-866c-f421e740b713-ad3c92b1-9cdb-4a7b-aad3-75ad809db8a3.png",
  IMAGE_03: "https://versatil-salescloud.relevantsolutions.com.br/images/98520d6c-5cef-449e-bcbf-6316ccec2088-e8780361-0deb-4896-895e-e690c886cdf0.png",
  IMAGE_04: "https://versatil-salescloud.relevantsolutions.com.br/images/b064f705-34ba-4400-975e-9dd0cec21c30-cc9aa158-56bd-4bf1-b532-72390d25c864.png",
  IMAGE_59: "https://versatil-salescloud.relevantsolutions.com.br/images/8e0e07e2-3f84-4426-84c1-2add355c558b-image.png",
  IMAGE_09: "https://versatil-salescloud.relevantsolutions.com.br/images/be34fb18-32ad-441c-84d8-3c0e9ba9f742-ad2ea5ff-5d0b-446b-bd7d-8e2ab5afdd16.png",
  IMAGE_10: "https://versatil-salescloud.relevantsolutions.com.br/images/6a1e6292-469e-452a-bbae-44e4b5ff7463-05e543b6-c951-44ce-ae27-ca1282c77f52.png",
  IMAGE_15: "https://versatil-salescloud.relevantsolutions.com.br/images/f69f48af-5b15-40aa-91c4-81d601d1357b-083dc99d-02a6-40d9-ae28-0662bd078b5d.png",
  IMAGE_16: "https://versatil-salescloud.relevantsolutions.com.br/images/9cce6b16-5a98-4ddb-b1a1-6cec2cf56891-c3acb856-8ab8-4cfb-93f9-2a0747678b8b.png",
  IMAGE_17: "https://versatil-salescloud.relevantsolutions.com.br/images/d9795c1d-fa32-4adb-ab25-30b7cfe87936-df21314f-6f05-4550-80b3-9ab1107e8fbe.png",
  IMAGE_31: "https://versatil-salescloud.relevantsolutions.com.br/images/dd1584fb-cb60-42c9-80c7-5545e16130ca-226ba72b-ce9e-4948-ad0d-347381fb96c5.png"
};
ImageManager.add(defaultImagesMap);
function getImg(name) {
  return ImageManager.get(name);
}
function mergeBlock(a, b) {
  return mergeWith(a, b, (a2, b2) => isArray(b2) ? b2 : void 0);
}
const Carousel$1 = createBlock({
  name: "Carrossel",
  type: BasicType.CAROUSEL,
  create: (payload) => {
    const defaultData = {
      type: BasicType.CAROUSEL,
      data: {
        value: {
          images: [
            {
              src: getImg("IMAGE_15"),
              target: "_blank"
            },
            {
              src: getImg("IMAGE_16"),
              target: "_blank"
            },
            {
              src: getImg("IMAGE_17"),
              target: "_blank"
            }
          ]
        }
      },
      attributes: {
        align: "center",
        "left-icon": "https://i.imgur.com/xTh3hln.png",
        "right-icon": "https://i.imgur.com/os7o9kz.png",
        "icon-width": "44px",
        thumbnails: "visible"
      },
      children: []
    };
    return mergeBlock(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN]
});
const Hero$1 = createBlock({
  name: "Her\xF3i",
  type: BasicType.HERO,
  create: (payload) => {
    const defaultData = {
      type: BasicType.HERO,
      data: {
        value: {}
      },
      attributes: {
        "background-color": "#ffffff",
        "background-position": "center center",
        mode: "fluid-height",
        padding: "100px 0px 100px 0px",
        "vertical-align": "top",
        "background-url": getImg("IMAGE_31")
      },
      children: [
        {
          type: "text",
          data: {
            value: {
              content: "Servimos Alimentos Saud\xE1veis \u200B\u200Be Deliciosos"
            }
          },
          attributes: {
            padding: "10px 25px 10px 25px",
            align: "center",
            color: "#ffffff",
            "font-size": "45px",
            "line-height": "45px"
          },
          children: []
        },
        {
          type: "text",
          data: {
            value: {
              content: "Um pequeno rio chamado Duden corre por seu lugar e fornece a regelialia necess\xE1ria. \xC9 um pa\xEDs paradis\xEDaco, em que partes de frases voam para a boca.<br>"
            }
          },
          attributes: {
            align: "center",
            "background-color": "#414141",
            color: "#ffffff",
            "font-weight": "normal",
            "border-radius": "3px",
            padding: "10px 25px 10px 25px",
            "inner-padding": "10px 25px 10px 25px",
            "line-height": "1.5",
            target: "_blank",
            "vertical-align": "middle",
            border: "none",
            "text-align": "center",
            href: "#",
            "font-size": "14px"
          },
          children: []
        },
        {
          type: "button",
          data: {
            value: {
              content: "Fa\xE7a seu pedido aqui!"
            }
          },
          attributes: {
            align: "center",
            "background-color": "#f3a333",
            color: "#ffffff",
            "font-size": "13px",
            "font-weight": "normal",
            "border-radius": "30px",
            padding: "10px 25px 10px 25px",
            "inner-padding": "10px 25px 10px 25px",
            "line-height": "120%",
            target: "_blank",
            "vertical-align": "middle",
            border: "none",
            "text-align": "center",
            href: "#"
          },
          children: []
        }
      ]
    };
    return mergeBlock(defaultData, payload);
  },
  validParentType: [BasicType.PAGE, BasicType.WRAPPER]
});
const Navbar$1 = createBlock({
  name: "Barra navega\xE7\xE3o",
  type: BasicType.NAVBAR,
  create: (payload) => {
    const defaultData = {
      type: BasicType.NAVBAR,
      data: {
        value: {
          links: [
            {
              href: "/gettings-started-onboard",
              content: "Come\xE7ando",
              color: "#1890ff",
              "font-size": "13px",
              target: "_blank",
              padding: "15px 10px"
            },
            {
              href: "/try-it-live",
              content: "Experimente ao vivo",
              color: "#1890ff",
              "font-size": "13px",
              target: "_blank",
              padding: "15px 10px"
            },
            {
              href: "/templates",
              content: "Modelos",
              color: "#1890ff",
              "font-size": "13px",
              target: "_blank",
              padding: "15px 10px"
            },
            {
              href: "/components",
              content: "Componentes",
              color: "#1890ff",
              "font-size": "13px",
              target: "_blank",
              padding: "15px 10px"
            }
          ]
        }
      },
      attributes: {
        align: "center"
      },
      children: []
    };
    return mergeBlock(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO]
});
const Social$1 = createBlock({
  name: "Rede Social",
  type: BasicType.SOCIAL,
  create: (payload) => {
    const defaultData = {
      type: BasicType.SOCIAL,
      data: {
        value: {
          elements: [
            {
              href: "#",
              target: "_blank",
              src: getImg("IMAGE_02"),
              content: "Facebook"
            },
            {
              href: "#",
              target: "_blank",
              src: getImg("IMAGE_03"),
              content: "Google"
            },
            {
              href: "",
              target: "_blank",
              src: getImg("IMAGE_04"),
              content: "Twitter"
            }
          ]
        }
      },
      attributes: {
        align: "center",
        color: "#333333",
        mode: "horizontal",
        "font-size": "13px",
        "font-weight": "normal",
        "border-radius": "3px",
        padding: "10px 25px 10px 25px",
        "inner-padding": "4px 4px 4px 4px",
        "line-height": "22px",
        "text-padding": "4px 4px 4px 0px",
        "icon-padding": "0px",
        "icon-size": "20px"
      },
      children: []
    };
    return mergeBlock(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN]
});
const Raw$1 = createBlock({
  name: "Raw",
  type: BasicType.RAW,
  create: (payload) => {
    const defaultData = {
      type: BasicType.RAW,
      data: {
        value: {
          content: "<% if (user) { %>"
        }
      },
      attributes: {},
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [
    BasicType.PAGE,
    BasicType.WRAPPER,
    BasicType.SECTION,
    BasicType.GROUP,
    BasicType.COLUMN,
    BasicType.HERO
  ]
});
const Template$1 = createBlock({
  name: "Modelo",
  type: BasicType.TEMPLATE,
  create: (payload) => {
    const defaultData = {
      type: BasicType.TEMPLATE,
      data: {
        value: {
          idx: ""
        }
      },
      attributes: {},
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: []
});
const AccordionElement$1 = createBlock({
  name: "Item acorde\xE3o",
  type: BasicType.ACCORDION_ELEMENT,
  create: (payload) => {
    const defaultData = {
      type: BasicType.ACCORDION_ELEMENT,
      data: {
        value: {}
      },
      attributes: {
        "icon-align": "middle",
        "icon-height": "32px",
        "icon-width": "32px",
        "icon-position": "right",
        padding: "10px 25px 10px 25px"
      },
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.ACCORDION]
});
const AccordionTitle$1 = createBlock({
  name: "T\xEDtulo acorde\xE3o",
  type: BasicType.ACCORDION_TITLE,
  create: (payload) => {
    const defaultData = {
      type: BasicType.ACCORDION_TITLE,
      data: {
        value: {
          content: "Por que usar um acorde\xE3o?"
        }
      },
      attributes: {
        "font-size": "13px",
        padding: "16px 16px 16px 16px"
      },
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.ACCORDION]
});
const AccordionText$1 = createBlock({
  name: "Texto acorde\xE3o",
  type: BasicType.ACCORDION_TEXT,
  create: (payload) => {
    const defaultData = {
      type: BasicType.ACCORDION_TEXT,
      data: {
        value: {
          content: "Como e-mails com muito conte\xFAdo s\xE3o na maioria das vezes uma experi\xEAncia muito ruim no celular, o mj-accordion \xE9 \xFAtil quando voc\xEA deseja fornecer muitas informa\xE7\xF5es de maneira concisa"
        }
      },
      attributes: {
        "font-size": "13px",
        padding: "16px 16px 16px 16px",
        "line-height": "1"
      },
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.ACCORDION]
});
const Accordion$1 = createBlock({
  name: "Acorde\xE3o",
  type: BasicType.ACCORDION,
  validParentType: [BasicType.COLUMN],
  create: (payload) => {
    const defaultData = {
      type: BasicType.ACCORDION,
      data: {
        value: {}
      },
      attributes: {
        "icon-height": "32px",
        "icon-width": "32px",
        "icon-align": "middle",
        "icon-position": "right",
        "icon-unwrapped-url": getImg("IMAGE_09"),
        "icon-wrapped-url": getImg("IMAGE_10"),
        padding: "10px 25px 10px 25px",
        border: "1px solid #d9d9d9"
      },
      children: [
        AccordionElement$1.create({
          children: [
            AccordionTitle$1.create({
              data: {
                value: {
                  content: "Por que usar um acorde\xE3o?"
                }
              }
            }),
            AccordionText$1.create({
              data: {
                value: {
                  content: "Como e-mails com muito conte\xFAdo s\xE3o na maioria das vezes uma experi\xEAncia muito ruim no celular, o mj-accordion \xE9 \xFAtil quando voc\xEA deseja fornecer muitas informa\xE7\xF5es de maneira concisa."
                }
              }
            })
          ]
        }),
        AccordionElement$1.create({
          children: [
            AccordionTitle$1.create({
              data: {
                value: {
                  content: "como funciona"
                }
              }
            }),
            AccordionText$1.create({
              data: {
                value: {
                  content: "O conte\xFAdo \xE9 empilhado em guias e os usu\xE1rios podem expandi-los \xE0 vontade. Se estilos responsivos n\xE3o forem suportados (principalmente em clientes de desktop), as guias ser\xE3o expandidas e seu conte\xFAdo poder\xE1 ser lido imediatamente."
                }
              }
            })
          ]
        })
      ]
    };
    return mergeBlock(defaultData, payload);
  }
});
const Table$1 = createBlock({
  name: "Tabela",
  type: BasicType.TABLE,
  create: (payload) => {
    const defaultData = {
      type: BasicType.TABLE,
      data: {
        value: {
          content: ""
        }
      },
      attributes: {},
      children: []
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN]
});
const standardBlocks = {
  Page: Page$1,
  Section: Section$1,
  Column: Column$1,
  Text: Text$1,
  Image: Image$1,
  Group: Group$1,
  Button: Button$1,
  Divider: Divider$1,
  Wrapper: Wrapper$1,
  Spacer: Spacer$1,
  Raw: Raw$1,
  Carousel: Carousel$1,
  Hero: Hero$1,
  Navbar: Navbar$1,
  Social: Social$1,
  Template: Template$1,
  Accordion: Accordion$1,
  AccordionElement: AccordionElement$1,
  AccordionTitle: AccordionTitle$1,
  AccordionText: AccordionText$1,
  Table: Table$1
};
function parseReactBlockToBlockData(node) {
  return JSON.parse(unescape(renderToStaticMarkup(node)));
}
function MjmlBlock({
  value,
  type,
  attributes,
  children
}) {
  const block = BlockManager.getBlockByType(type);
  if (!block) {
    throw new Error(`Can no find ${type}`);
  }
  const mergeValue = useMemo(() => {
    if (typeof children === "string") {
      if (!value) {
        return {
          content: children
        };
      } else {
        set(value, "content", children);
        return value;
      }
    }
    return value;
  }, [children, value]);
  const getChild = (child) => {
    if (!child)
      return null;
    if (isValidBlockData(child))
      return child;
    if (isValidElement(child))
      return parseReactBlockToBlockData(child);
    return child;
  };
  const getChildren = () => {
    if (Array.isArray(children)) {
      return children.map(getChild).filter(Boolean);
    }
    if (isValidBlockData(children)) {
      return [children];
    }
    if (typeof children === "string")
      return [];
    return React.Children.map(children, getChild);
  };
  const instance = block.create({
    data: {
      value: mergeValue
    },
    attributes,
    children: getChildren() || []
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, JSON.stringify(instance));
}
function Page(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.PAGE
  }, props.children);
}
function Section(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.SECTION
  }, props.children);
}
function Column(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.COLUMN
  }, props.children);
}
function Text(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.TEXT
  }, props.children);
}
function Image(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.IMAGE
  }, props.children);
}
function Group(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.GROUP
  }, props.children);
}
function Button(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.BUTTON
  }, props.children);
}
function Divider(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.DIVIDER
  }, props.children);
}
function Wrapper(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.WRAPPER
  }, props.children);
}
function Spacer(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.SPACER
  }, props.children);
}
function Raw(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.RAW
  }, props.children);
}
function Accordion(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.ACCORDION
  }, props.children);
}
function AccordionElement(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.ACCORDION_ELEMENT
  }, props.children);
}
function AccordionTitle(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.ACCORDION_TITLE
  }, props.children);
}
function AccordionText(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.ACCORDION_TEXT
  }, props.children);
}
function Carousel(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.CAROUSEL
  }, props.children);
}
function Hero(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.HERO
  }, props.children);
}
function Navbar(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.NAVBAR
  }, props.children);
}
function Social(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.SOCIAL
  }, props.children);
}
function Table(props) {
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    value: props.value,
    type: BasicType.TABLE
  }, props.children);
}
function Template(props) {
  let formatChildren = props.children;
  if (Array.isArray(formatChildren)) {
    formatChildren = flatMap(formatChildren);
  }
  return /* @__PURE__ */ React.createElement(MjmlBlock, {
    attributes: omit(props, ["data", "children", "value"]),
    type: BasicType.TEMPLATE,
    value: { idx: props.idx }
  }, formatChildren);
}
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  Page,
  Section,
  Column,
  Text,
  Image,
  Group,
  Button,
  Divider,
  Wrapper,
  Spacer,
  Raw,
  Accordion,
  AccordionElement,
  AccordionTitle,
  AccordionText,
  Carousel,
  Hero,
  Navbar,
  Social,
  Table,
  Template,
  MjmlBlock
});
function createCustomBlock(block) {
  return __spreadValues({}, block);
}
function generateAdvancedBlock(option) {
  const baseBlock = Object.values(standardBlocks).find((b) => b.type === option.baseType);
  if (!baseBlock) {
    throw new Error(`Can not find ${option.baseType}`);
  }
  return createCustomBlock({
    name: baseBlock.name,
    type: option.type,
    validParentType: option.validParentType,
    create: (payload) => {
      const defaultData = __spreadProps(__spreadValues({}, baseBlock.create()), {
        type: option.type
      });
      return merge(defaultData, payload);
    },
    render: (data, idx, mode, context, dataSource) => {
      const { iteration, condition } = data.data.value;
      const getBaseContent = (bIdx, index2) => option.getContent({
        index: index2,
        data,
        idx: bIdx,
        mode,
        context,
        dataSource
      });
      let children = getBaseContent(idx, 0);
      if (mode === "testing") {
        return /* @__PURE__ */ React.createElement(Template, null, children, /* @__PURE__ */ React.createElement(Template, null, new Array(((iteration == null ? void 0 : iteration.mockQuantity) || 1) - 1).fill(true).map((_, index2) => /* @__PURE__ */ React.createElement(Template, {
          key: index2
        }, /* @__PURE__ */ React.createElement(Template, null, getBaseContent(idx, index2 + 1))))));
      }
      if (condition && condition.enabled) {
        children = TemplateEngineManager.generateTagTemplate("condition")(condition, children);
      }
      if (iteration && iteration.enabled) {
        children = TemplateEngineManager.generateTagTemplate("iteration")(iteration, /* @__PURE__ */ React.createElement(Template, null, children));
      }
      return children;
    }
  });
}
var Operator;
(function(Operator2) {
  Operator2["TRUTHY"] = "truthy";
  Operator2["FALSY"] = "falsy";
  Operator2["EQUAL"] = "==";
  Operator2["NOT_EQUAL"] = "!=";
  Operator2["GREATER"] = ">";
  Operator2["GREATER_OR_EQUAL"] = ">=";
  Operator2["LESS"] = "<";
  Operator2["LESS_OR_EQUAL"] = "<=";
})(Operator || (Operator = {}));
var OperatorSymbol;
(function(OperatorSymbol2) {
  OperatorSymbol2["AND"] = "and";
  OperatorSymbol2["OR"] = "or";
})(OperatorSymbol || (OperatorSymbol = {}));
function classnames(...rest) {
  return rest.filter((item) => typeof item === "string").join(" ");
}
function ancestorOf(type, targetType) {
  let level = -1;
  const paths = BlockManager.getAutoCompletePath(type, targetType);
  if (paths) {
    return paths.length + 1;
  }
  return level;
}
function getPageIdx() {
  return "content";
}
function getChildIdx(idx, index2) {
  return `${idx}.children.[${index2}]`;
}
function getNodeIdxClassName(idx) {
  return `node-idx-${idx}`;
}
function getNodeTypeClassName(type) {
  return `node-type-${type}`;
}
function getNodeIdxFromClassName(classList) {
  var _a;
  return (_a = Array.from(classList).find((item) => item.includes("node-idx-"))) == null ? void 0 : _a.replace("node-idx-", "");
}
function getNodeTypeFromClassName(classList) {
  var _a;
  return (_a = Array.from(isString(classList) ? classList.split(" ") : classList).find((item) => item.includes("node-type-"))) == null ? void 0 : _a.replace("node-type-", "");
}
const getIndexByIdx = (idx) => {
  var _a;
  return Number((_a = /\.\[(\d+)\]$/.exec(idx)) == null ? void 0 : _a[1]) || 0;
};
const getParentIdx = (idx) => {
  var _a;
  if (idx === getPageIdx())
    return void 0;
  return (_a = /(.*)\.children\.\[\d+\]$/.exec(idx)) == null ? void 0 : _a[1];
};
const getValueByIdx = (values, idx) => {
  return get(values, idx);
};
const getParentByIdx = (values, idx) => {
  return get(values, getParentIdx(idx) || "");
};
const getSiblingIdx = (sourceIndex, num) => {
  return sourceIndex.replace(/\[(\d+)\]$/, (_, index2) => {
    if (Number(index2) + num < 0)
      return "[0]";
    return `[${Number(index2) + num}]`;
  });
};
const getParentByType = (context, idx, type) => {
  if (!idx)
    return null;
  let parentIdx = getParentIdx(idx);
  while (parentIdx) {
    const parent = get(context, parentIdx);
    if (parent && parent.type === type)
      return parent;
    parentIdx = getParentIdx(idx);
  }
  return null;
};
const getSameParent = (values, idx, dragType) => {
  let parentIdx = idx;
  const block = BlockManager.getBlockByType(dragType);
  if (!block)
    return null;
  while (parentIdx) {
    const parent = get(values, parentIdx);
    if (ancestorOf(block.type, parent.type) > 0) {
      return {
        parent,
        parentIdx
      };
    }
    parentIdx = getParentIdx(parentIdx);
  }
  return null;
};
const getParenRelativeByType = (context, idx, type) => {
  let prevIdx = "";
  let parentIdx = idx;
  while (parentIdx) {
    const parent = get(context, parentIdx);
    if (parent && parent.type === type) {
      return {
        insertIndex: prevIdx ? getIndexByIdx(prevIdx) : parent.children.length - 1,
        parentIdx,
        parent
      };
    } else {
      prevIdx = parentIdx;
      parentIdx = getParentIdx(parentIdx);
    }
  }
  return null;
};
const getValidChildBlocks = (type) => {
  return BlockManager.getBlocks().filter((item) => item.validParentType.includes(type));
};
function getPreviewClassName(idx, type) {
  return classnames("email-block", idx && getNodeIdxClassName(idx), getNodeTypeClassName(type));
}
function generateAdvancedContentBlock(option) {
  return generateAdvancedBlock(__spreadProps(__spreadValues({}, option), {
    validParentType: [
      BasicType.PAGE,
      BasicType.WRAPPER,
      BasicType.COLUMN,
      BasicType.GROUP,
      BasicType.HERO,
      AdvancedType.WRAPPER,
      AdvancedType.COLUMN,
      AdvancedType.GROUP,
      AdvancedType.HERO
    ],
    getContent: (params) => {
      const { data, idx, mode, context, dataSource, index: index2 } = params;
      const previewClassName = mode === "testing" ? classnames(index2 === 0 && idx && getPreviewClassName(idx, data.type)) : "";
      const blockData = __spreadProps(__spreadValues({}, data), {
        type: option.baseType,
        attributes: __spreadProps(__spreadValues({}, data.attributes), {
          "css-class": classnames(data.attributes["css-class"], previewClassName)
        })
      });
      const parentBlockData = getParentByIdx({ content: context }, idx);
      if (!parentBlockData) {
        return /* @__PURE__ */ React.createElement(Template, null, blockData);
      }
      if (parentBlockData.type === BasicType.PAGE || parentBlockData.type === BasicType.WRAPPER || parentBlockData.type === AdvancedType.WRAPPER) {
        return /* @__PURE__ */ React.createElement(Section, {
          padding: "0px"
        }, /* @__PURE__ */ React.createElement(Column, null, blockData));
      }
      return blockData;
    }
  }));
}
function generateAdvancedLayoutBlock(option) {
  return generateAdvancedBlock(__spreadProps(__spreadValues({}, option), {
    getContent: (params) => {
      const { data, idx, mode, context, dataSource, index: index2 } = params;
      const { iteration } = data.data.value;
      const blockData = __spreadProps(__spreadValues({}, data), {
        type: option.baseType
      });
      if (data.type === AdvancedType.COLUMN && (iteration == null ? void 0 : iteration.enabled)) {
        data.attributes.width = data.attributes.width || "100%";
      }
      const previewClassName = mode === "testing" ? classnames(index2 === 0 && getPreviewClassName(idx, data.type)) : "";
      return /* @__PURE__ */ React.createElement(MjmlBlock, {
        type: blockData.type,
        attributes: __spreadProps(__spreadValues({}, blockData.attributes), {
          "css-class": classnames(data.attributes["css-class"], previewClassName)
        }),
        value: blockData.data.value
      }, /* @__PURE__ */ React.createElement(Template, {
        idx: index2 === 0 ? idx : null
      }, data.children));
    }
  }));
}
const AdvancedText = generateAdvancedContentBlock({
  type: AdvancedType.TEXT,
  baseType: BasicType.TEXT
});
const AdvancedButton = generateAdvancedContentBlock({
  type: AdvancedType.BUTTON,
  baseType: BasicType.BUTTON
});
const AdvancedImage = generateAdvancedContentBlock({
  type: AdvancedType.IMAGE,
  baseType: BasicType.IMAGE
});
const AdvancedDivider = generateAdvancedContentBlock({
  type: AdvancedType.DIVIDER,
  baseType: BasicType.DIVIDER
});
const AdvancedSpacer = generateAdvancedContentBlock({
  type: AdvancedType.SPACER,
  baseType: BasicType.SPACER
});
const AdvancedNavbar = generateAdvancedContentBlock({
  type: AdvancedType.NAVBAR,
  baseType: BasicType.NAVBAR
});
const AdvancedAccordion = generateAdvancedContentBlock({
  type: AdvancedType.ACCORDION,
  baseType: BasicType.ACCORDION
});
const AdvancedCarousel = generateAdvancedContentBlock({
  type: AdvancedType.CAROUSEL,
  baseType: BasicType.CAROUSEL
});
const AdvancedSocial = generateAdvancedContentBlock({
  type: AdvancedType.SOCIAL,
  baseType: BasicType.SOCIAL
});
const AdvancedWrapper = generateAdvancedLayoutBlock({
  type: AdvancedType.WRAPPER,
  baseType: BasicType.WRAPPER,
  validParentType: [BasicType.PAGE]
});
const AdvancedSection = generateAdvancedLayoutBlock({
  type: AdvancedType.SECTION,
  baseType: BasicType.SECTION,
  validParentType: [BasicType.PAGE, BasicType.WRAPPER, AdvancedType.WRAPPER]
});
const AdvancedGroup = generateAdvancedLayoutBlock({
  type: AdvancedType.GROUP,
  baseType: BasicType.GROUP,
  validParentType: [BasicType.SECTION, AdvancedType.SECTION]
});
const AdvancedColumn = generateAdvancedLayoutBlock({
  type: AdvancedType.COLUMN,
  baseType: BasicType.COLUMN,
  validParentType: [
    BasicType.SECTION,
    AdvancedType.SECTION,
    BasicType.GROUP,
    AdvancedType.GROUP
  ]
});
const AdvancedHero = generateAdvancedLayoutBlock({
  type: AdvancedType.HERO,
  baseType: BasicType.HERO,
  validParentType: [
    BasicType.WRAPPER,
    AdvancedType.WRAPPER,
    BasicType.PAGE
  ]
});
const advancedBlocks = {
  [AdvancedType.TEXT]: AdvancedText,
  [AdvancedType.BUTTON]: AdvancedButton,
  [AdvancedType.IMAGE]: AdvancedImage,
  [AdvancedType.DIVIDER]: AdvancedDivider,
  [AdvancedType.SPACER]: AdvancedSpacer,
  [AdvancedType.NAVBAR]: AdvancedNavbar,
  [AdvancedType.ACCORDION]: AdvancedAccordion,
  [AdvancedType.CAROUSEL]: AdvancedCarousel,
  [AdvancedType.SOCIAL]: AdvancedSocial,
  [AdvancedType.WRAPPER]: AdvancedWrapper,
  [AdvancedType.SECTION]: AdvancedSection,
  [AdvancedType.GROUP]: AdvancedGroup,
  [AdvancedType.COLUMN]: AdvancedColumn,
  [AdvancedType.HERO]: AdvancedHero
};
class BlockManager {
  static setAutoCompletePath() {
    const paths = {};
    const renderFullPath = (type, pathObj, prevPaths) => {
      const block = this.getBlockByType(type);
      if (!block) {
        throw new Error(`Can you register ${type} block`);
      }
      const currentPaths = [...prevPaths, type];
      if (block.validParentType.length === 0) {
        pathObj.push(currentPaths);
      }
      return block.validParentType.map((item) => {
        return renderFullPath(item, pathObj, currentPaths);
      });
    };
    Object.values(this.blocksMap).forEach((item) => {
      paths[item.type] = [];
      renderFullPath(item.type, paths[item.type], []);
    });
    return paths;
  }
  static getBlocks() {
    return Object.values(this.blocksMap);
  }
  static registerBlocks(blocksMap) {
    this.blocksMap = __spreadValues(__spreadValues({}, this.blocksMap), blocksMap);
    this.autoCompletePath = this.setAutoCompletePath();
  }
  static getBlockByType(type) {
    const map = this.getBlocksByType([type]);
    return map[0];
  }
  static getBlocksByType(types) {
    return types.map((item) => {
      const block = Object.values(this.blocksMap).find((child) => {
        return child.type === item;
      });
      return block;
    });
  }
  static getAutoCompleteFullPath() {
    if (Object.keys(this.autoCompletePath).length === 0) {
      this.autoCompletePath = this.setAutoCompletePath();
    }
    return this.autoCompletePath;
  }
  static getAutoCompletePath(type, targetType) {
    const block = this.getBlockByType(type);
    if (!block) {
      throw new Error(`Can you register ${type} block`);
    }
    if (block.validParentType.includes(targetType)) {
      return [];
    }
    const paths = this.getAutoCompleteFullPath()[type].find((item) => item.filter((_, index2) => index2 !== 0).includes(targetType));
    if (!paths)
      return null;
    const findIndex = paths.findIndex((item) => item === targetType);
    return paths.slice(1, findIndex);
  }
}
__publicField(BlockManager, "blocksMap", __spreadValues(__spreadValues({}, standardBlocks), advancedBlocks));
__publicField(BlockManager, "autoCompletePath", {});
function isValidBlockData(data) {
  try {
    if (data.attributes && data.children && data.data && data.type && BlockManager.getBlockByType(data.type)) {
      return true;
    }
  } catch (error) {
  }
  return false;
}
const isProductionMode = (option) => option.mode === "production";
function JsonToMjml(options) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const {
    data,
    idx = "content",
    context = data,
    mode = "production",
    dataSource = {}
  } = options;
  if (isBoolean((_a = data == null ? void 0 : data.data) == null ? void 0 : _a.hidden) && ((_b = data == null ? void 0 : data.data) == null ? void 0 : _b.hidden) || ((_c = data == null ? void 0 : data.data) == null ? void 0 : _c.hidden) === "true") {
    return "";
  }
  const att = pickBy(__spreadValues({}, data.attributes), identity);
  const isTest = mode === "testing";
  const keepClassName = isProductionMode(options) ? options.keepClassName : false;
  const placeholder = isTest ? renderPlaceholder(data.type) : "";
  if (isTest && idx) {
    att["css-class"] = classnames(att["css-class"], "email-block", getNodeIdxClassName(idx), getNodeTypeClassName(data.type));
  }
  if (keepClassName) {
    att["css-class"] = classnames(att["css-class"], getNodeTypeClassName(data.type));
  }
  if (isTest && data.type === BasicType.TEXT) {
    att["css-class"] = classnames(att["css-class"], MERGE_TAG_CLASS_NAME);
  }
  if (data.type === BasicType.PAGE) {
    att["css-class"] = classnames(att["css-class"], "mjml-body");
  }
  const attributeStr = Object.keys(att).filter((key) => att[key] !== "").map((key) => {
    const val = isString(att[key]) ? att[key].replace(/"/gm, "") : att[key];
    return `${key}="${val}"`;
  }).join(" ");
  const block = BlockManager.getBlockByType(data.type);
  if (!block) {
    throw new Error(`N\xE3o consigo encontrar ${data.type} bloco!!! Voc\xEA registrou este bloco ?`);
  }
  if (block.render) {
    const transformBlockData = block.render(data, idx, mode, context, dataSource);
    if (!transformBlockData)
      return "";
    const transformData = isValidElement(transformBlockData) ? parseReactBlockToBlockData(transformBlockData) : transformBlockData;
    att["css-class"] = [
      ...new Set(classnames(isTest && getPreviewClassName(idx, data.type), (_d = transformData == null ? void 0 : transformData["attributes"]) == null ? void 0 : _d["css-class"]).split(" "))
    ].join(" ");
    return JsonToMjml({
      data: __spreadProps(__spreadValues({}, transformData), {
        attributes: __spreadProps(__spreadValues({}, transformData.attributes), {
          "css-class": att["css-class"]
        })
      }),
      idx: null,
      context,
      dataSource,
      mode,
      keepClassName
    });
  }
  const children = data.children.map((child, index2) => {
    let childIdx = idx ? getChildIdx(idx, index2) : null;
    if (data.type === BasicType.TEMPLATE) {
      childIdx = getChildIdx(data.data.value.idx, index2);
      if (!data.data.value.idx) {
        childIdx = null;
      }
    }
    return JsonToMjml({
      data: child,
      idx: childIdx,
      dataSource,
      context,
      mode,
      keepClassName
    });
  }).join("\n");
  switch (data.type) {
    case BasicType.TEMPLATE:
      return children || data.data.value.content;
    case BasicType.PAGE:
      const metaData = generaMjmlMetaData(data);
      const value = data.data.value;
      const breakpoint = value.breakpoint ? `<mj-breakpoint width="${data.data.value.breakpoint}" />` : "";
      const nonResponsive = !value.responsive ? `<mj-raw>
            <meta name="viewport" />
           </mj-raw>
           <mj-style inline="inline">.mjml-body { width: ${data.attributes.width || "600px"}; margin: 0px auto; }</mj-style>` : "";
      const styles = ((_e = value.headStyles) == null ? void 0 : _e.map((style) => `<mj-style ${style.inline ? 'inline="inline"' : ""}>${style.content}</mj-style>`).join("\n")) || "";
      const userStyle = value["user-style"] ? `<mj-style ${value["user-style"].inline ? 'inline="inline"' : ""}>${value["user-style"].content}</mj-style>` : "";
      const extraHeadContent = value.extraHeadContent ? `<mj-raw>${value.extraHeadContent}</mj-raw>` : "";
      return `
        <mjml>
          <mj-head>
              ${metaData}
              ${nonResponsive}
              ${styles}
              ${userStyle}
              ${breakpoint}
              ${extraHeadContent}
              ${(_f = value.fonts) == null ? void 0 : _f.filter(Boolean).map((item) => `<mj-font name="${item.name}" href="${item.href}" />`)}
            <mj-attributes>
              ${value.headAttributes}
              ${value["font-family"] ? `<mj-all font-family="${value["font-family"].replace(/"/gm, "")}" />` : ""}
              ${value["font-size"] ? `<mj-text font-size="${value["font-size"]}" />` : ""}
              ${value["text-color"] ? `<mj-text color="${value["text-color"]}" />` : ""}
        ${value["line-height"] ? `<mj-text line-height="${value["line-height"]}" />` : ""}
        ${value["font-weight"] ? `<mj-text font-weight="${value["font-weight"]}" />` : ""}
              ${value["content-background-color"] ? `<mj-wrapper background-color="${value["content-background-color"]}" />
                     <mj-section background-color="${value["content-background-color"]}" />
                    ` : ""}

            </mj-attributes>
          </mj-head>
          <mj-body ${attributeStr}>
            ${children}
          </mj-body>
        </mjml>
        `;
    case BasicType.COLUMN:
      return `
              <mj-column ${attributeStr}>
               ${children || placeholder}
              </mj-column>
            `;
    case BasicType.SECTION:
      return `
              <mj-section ${attributeStr}>
               ${children || `<mj-column>${placeholder}</mj-column>`}
              </mj-section>
            `;
    case BasicType.GROUP:
      return `
              <mj-group ${attributeStr}>
               ${children || `<mj-column>${placeholder}</mj-column>`}
              </mj-group>
            `;
    case BasicType.WRAPPER:
      return `
              <mj-wrapper ${attributeStr}>
               ${children || `<mj-section><mj-column>${placeholder}</mj-column></mj-section>`}
              </mj-wrapper>
            `;
    case BasicType.CAROUSEL:
      const carouselImages = data.data.value.images.map((image, index2) => {
        const imageAttributeStr = Object.keys(image).filter((key) => key !== "content" && att[key] !== "").map((key) => `${key}="${image[key]}"`).join(" ");
        return `
          <mj-carousel-image ${imageAttributeStr} />
          `;
      }).join("\n");
      return `
        <mj-carousel ${attributeStr}>
         ${carouselImages}
        </mj-carousel>
      `;
    case BasicType.NAVBAR:
      const links = data.data.value.links.map((link, index2) => {
        const linkAttributeStr = Object.keys(link).filter((key) => key !== "content" && att[key] !== "").map((key) => `${key}="${link[key]}"`).join(" ");
        return `
          <mj-navbar-link ${linkAttributeStr}>${link.content}</mj-navbar-link>
          `;
      }).join("\n");
      return `
              <mj-navbar ${attributeStr}>
               ${links}
              </mj-navbar>
            `;
    case BasicType.SOCIAL:
      const elements = data.data.value.elements.map((element, index2) => {
        const elementAttributeStr = Object.keys(element).filter((key) => key !== "content" && att[key] !== "").map((key) => `${key}="${element[key]}"`).join(" ");
        return `
          <mj-social-element ${elementAttributeStr}>${element.content}</mj-social-element>
          `;
      }).join("\n");
      return `
              <mj-social ${attributeStr}>
               ${elements}
              </mj-social>
            `;
    case BasicType.RAW:
      return `
              <mj-raw ${attributeStr}>
                ${(_g = data.data.value) == null ? void 0 : _g.content}
              </mj-raw>
            `;
    case BasicType.IMAGE:
      if (mode === "testing") {
        const url = data.attributes.src;
        if (url === "" || /{{([\s\S]+?)}}/g.test(url) || /\*\|([^\|\*]+)\|\*/g.test(url)) {
          return `<mj-image src="${getImg("IMAGE_59")}"  ${attributeStr}></mj-image>`;
        }
      }
      return `<mj-image ${attributeStr}></mj-image>`;
    default:
      return `
          <mj-${data.type} ${attributeStr}>
           ${children || ((_h = data.data.value) == null ? void 0 : _h.content) || ""}
          </mj-${data.type}>
        `;
  }
}
function renderPlaceholder(type) {
  let text = "";
  if (type === BasicType.PAGE) {
    text = "Arraste um bloco env\xF3lucro aqui";
  } else if (type === BasicType.WRAPPER || type === AdvancedType.WRAPPER) {
    text = "Arraste um bloco sess\xE3o aqui";
  } else if (type === BasicType.SECTION || type === BasicType.GROUP || type === AdvancedType.SECTION || type === AdvancedType.GROUP) {
    text = "Arraste um bloco sess\xE3o aqui";
  } else if (type === BasicType.COLUMN || type === AdvancedType.COLUMN) {
    text = "Arraste um bloco conte\xFAdo aqui";
  }
  return `
   <mj-text color="#666">
    <div style="text-align: center">
      <div>
        <svg width="300" fill="currentColor" style="max-width: 100%;" viewBox="-20 -5 80 60">
          <g>
            <path d="M23.713 23.475h5.907c.21 0 .38.17.38.38v.073c0 .21-.17.38-.38.38h-5.907a.38.38 0 0 1-.38-.38v-.073c0-.21.17-.38.38-.38zm.037-2.917h9.167a.417.417 0 0 1 0 .834H23.75a.417.417 0 0 1 0-.834zm0-2.5h9.167a.417.417 0 0 1 0 .834H23.75a.417.417 0 0 1 0-.834zm-.037-3.333h5.907c.21 0 .38.17.38.38v.073c0 .21-.17.38-.38.38h-5.907a.38.38 0 0 1-.38-.38v-.073c0-.21.17-.38.38-.38zm.037-2.917h9.167a.417.417 0 0 1 0 .834H23.75a.417.417 0 0 1 0-.834zm0-2.916h9.167a.417.417 0 0 1 0 .833H23.75a.417.417 0 0 1 0-.833zm-3.592 8.75a.675.675 0 0 1 .675.691v6.142c0 .374-.3.679-.675.683h-6.15a.683.683 0 0 1-.675-.683v-6.142a.675.675 0 0 1 .675-.691h6.15zM20 24.308v-5.833h-5.833v5.833H20zm.158-15.833a.675.675 0 0 1 .675.692v6.141c0 .374-.3.68-.675.684h-6.15a.683.683 0 0 1-.675-.684V9.167a.675.675 0 0 1 .675-.692h6.15zM20 15.142V9.308h-5.833v5.834H20zM37.167 0A2.809 2.809 0 0 1 40 2.833V30.5a2.809 2.809 0 0 1-2.833 2.833h-3.834v3H32.5v-3h-23A2.808 2.808 0 0 1 6.667 30.5v-23H3.583v-.833h3.084V2.833A2.808 2.808 0 0 1 9.5 0h27.667zm2 30.5V2.833a2.025 2.025 0 0 0-2-2H9.5a2.025 2.025 0 0 0-2 2V30.5a2.025 2.025 0 0 0 2 2h27.667a2.025 2.025 0 0 0 2-2zM0 27.75h.833V31H0v-3.25zm0-13h.833V18H0v-3.25zm0 22.833V34.25h.833v3.25L0 37.583zM0 21.25h.833v3.25H0v-3.25zM2.583 40l.084-.833h3.166V40h-3.25zm27.917-.833c.376.006.748-.08 1.083-.25l.417.666a2.875 2.875 0 0 1-1.5.417h-1.833v-.833H30.5zm-8.333 0h3.25V40h-3.25v-.833zm-6.584 0h3.25V40h-3.25v-.833zm-6.5 0h3.25V40h-3.25v-.833zM0 9.5c.01-.5.154-.99.417-1.417l.666.417c-.17.305-.256.65-.25 1v2H0v-2z"></path>
          </g>
          <text x="-16" y="50" font-size="4px">${text}</text>
        </svg>
      </div>
    </div>
   </mj-text>
  `;
}
function generaMjmlMetaData(data) {
  const values = data.data.value;
  const attributes = [
    "content-background-color",
    "text-color",
    "font-family",
    "font-size",
    "line-height",
    "font-weight",
    "user-style",
    "responsive"
  ];
  return `
    <mj-html-attributes>
      ${attributes.filter((key) => values[key] !== void 0).map((key) => {
    const attKey = key;
    const isMultipleAttributes = isObject(values[attKey]);
    const value = isMultipleAttributes ? Object.keys(values[attKey]).map((childKey) => {
      const childValue = values[attKey][childKey];
      return `${childKey}="${isString(childValue) ? childValue.replace(/"/gm, "") : childValue}"`;
    }).join(" ") : `${key}="${values[attKey]}"`;
    return `<mj-html-attribute class="anteros-email" multiple-attributes="${isMultipleAttributes}" attribute-name="${key}" ${value}></mj-html-attribute>`;
  }).join("\n")}

    </mj-html-attributes>
  `;
}
const domParser = new DOMParser();
function parseXMLtoBlock(text) {
  const dom = domParser.parseFromString(text, "text/xml");
  const root = dom.firstChild;
  if (!(dom.firstChild instanceof Element)) {
    throw new Error("Invalid content");
  }
  if (root.tagName === "mjml") {
    const { json } = mjml(text, {
      validationLevel: "soft"
    });
    const parseValue = MjmlToJson(json);
    return parseValue;
  }
  const transform = (node) => {
    var _a;
    if (node.tagName === "parsererror") {
      throw new Error("Invalid content");
    }
    const attributes = {};
    node.getAttributeNames().forEach((name) => {
      attributes[name] = node.getAttribute(name);
    });
    const type = node.tagName.replace("mj-", "");
    if (!BlockManager.getBlockByType(type)) {
      if (!node.parentElement || node.parentElement.tagName !== "mj-text")
        throw new Error("Invalid content");
    }
    const block = {
      type,
      attributes,
      data: {
        value: {
          content: (_a = node.textContent) == null ? void 0 : _a.trim()
        }
      },
      children: [...node.children].filter((item) => item instanceof Element).map(transform)
    };
    switch (type) {
      case BasicType.TEXT:
        block.data.value.content = node.innerHTML;
        block.children = [];
    }
    return block;
  };
  return transform(root);
}
function MjmlToJson(data) {
  if (isString(data))
    return parseXMLtoBlock(data);
  const transform = (item) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const attributes = item.attributes;
    switch (item.tagName) {
      case "mjml":
        const body = (_a = item.children) == null ? void 0 : _a.find((item2) => item2.tagName === "mj-body");
        const head = (_b = item.children) == null ? void 0 : _b.find((item2) => item2.tagName === "mj-head");
        const metaData = getMetaDataFromMjml(head);
        const fonts = ((_c = head == null ? void 0 : head.children) == null ? void 0 : _c.filter((child) => child.tagName === "mj-font").map((child) => ({
          name: child.attributes.name,
          href: child.attributes.href
        }))) || [];
        const mjAttributes = ((_e = (_d = head == null ? void 0 : head.children) == null ? void 0 : _d.find((item2) => item2.tagName === "mj-attributes")) == null ? void 0 : _e.children) || [];
        const headStyles = (_f = head == null ? void 0 : head.children) == null ? void 0 : _f.filter((item2) => item2.tagName === "mj-style").map((item2) => ({ content: item2.content, inline: item2.inline }));
        const headAttributes = [
          ...new Set(mjAttributes.filter((item2) => {
            const isFontFamily = item2.tagName === "mj-all" && item2.attributes["font-family"] === metaData["font-family"];
            const isTextColor = item2.tagName === "mj-text" && item2.attributes["color"] === metaData["text-color"];
            const isContentColor = ["mj-wrapper", "mj-section"].includes(item2.tagName) && item2.attributes["background-color"] === metaData["content-background-color"];
            return !isFontFamily && !isTextColor && !isContentColor;
          }).map((item2) => `<${item2.tagName} ${Object.keys(item2.attributes).map((key) => `${key}="${item2.attributes[key]}"`).join(" ")} />`))
        ].join("\n");
        const breakpoint = (_g = head == null ? void 0 : head.children) == null ? void 0 : _g.find((item2) => item2.tagName === "mj-breakpoint");
        return BlockManager.getBlockByType(BasicType.PAGE).create({
          attributes: body.attributes,
          children: (_h = body.children) == null ? void 0 : _h.map(transform),
          data: {
            value: __spreadValues({
              headAttributes,
              headStyles,
              fonts,
              breakpoint: breakpoint == null ? void 0 : breakpoint.attributes.breakpoint
            }, metaData)
          }
        });
      default:
        const tag = item.tagName.replace("mj-", "").toLowerCase();
        const block = BlockManager.getBlockByType(tag);
        if (!block) {
          throw new Error(`${tag} block no found `);
        }
        const payload = {
          type: block.type,
          attributes,
          data: {
            value: {}
          },
          children: []
        };
        if (item.content) {
          payload.data.value.content = item.content;
        }
        if (block.type === BasicType.CAROUSEL) {
          payload.data.value.images = ((_i = item.children) == null ? void 0 : _i.map((child) => {
            return child.attributes;
          })) || [];
          payload.children = [];
        } else if (block.type === BasicType.NAVBAR) {
          payload.data.value.links = ((_j = item.children) == null ? void 0 : _j.map((child) => {
            const navbarLinkData = __spreadProps(__spreadValues({
              color: "#1890ff",
              "font-size": "13px",
              target: "_blank",
              padding: "15px 10px"
            }, child.attributes), {
              content: child.content
            });
            formatPadding(navbarLinkData, "padding");
            return navbarLinkData;
          })) || [];
          payload.children = [];
        } else if (block.type === BasicType.SOCIAL) {
          payload.data.value.elements = ((_k = item.children) == null ? void 0 : _k.map((child) => {
            return __spreadProps(__spreadValues({}, child.attributes), {
              content: child.content
            });
          })) || [];
          payload.children = [];
        } else if (item.children) {
          payload.children = item.children.map(transform);
        }
        const blockData = block.create(payload);
        formatPadding(blockData.attributes, "padding");
        formatPadding(blockData.attributes, "inner-padding");
        return blockData;
    }
  };
  return transform(data);
}
function getMetaDataFromMjml(data) {
  var _a;
  const mjmlHtmlAttributes = (_a = data == null ? void 0 : data.children) == null ? void 0 : _a.filter((item) => item.tagName === "mj-html-attributes").map((item) => item.children).flat().filter((item) => item && item.attributes.class === "anteros-email").reduce((obj, item) => {
    if (!item)
      return obj;
    const name = item.attributes["attribute-name"];
    const isMultipleAttributes = Boolean(item.attributes["multiple-attributes"]);
    obj[name] = isMultipleAttributes ? pickBy(__spreadProps(__spreadValues({}, item.attributes), {
      "attribute-name": void 0,
      "multiple-attributes": void 0,
      class: void 0
    }), identity) : item.attributes[name];
    return obj;
  }, {});
  return pickBy(mjmlHtmlAttributes, identity);
}
function formatPadding(attributes, attributeName) {
  const ele = document.createElement("div");
  Object.keys(attributes).forEach((key) => {
    var _a;
    if (new RegExp(`^${attributeName}`).test(key)) {
      const formatKey = (_a = new RegExp(`^${attributeName}(.*)`).exec(key)) == null ? void 0 : _a[0];
      if (formatKey) {
        ele.style[formatKey] = attributes[key];
        delete attributes[key];
      }
    }
  });
  const newPadding = [
    ele.style.paddingTop,
    ele.style.paddingRight,
    ele.style.paddingBottom,
    ele.style.paddingLeft
  ].filter(Boolean).join(" ");
  if (newPadding) {
    attributes[attributeName] = newPadding;
  }
}
function createBlockDataByType(type, payload) {
  const component = BlockManager.getBlockByType(type);
  if (component) {
    return component.create(payload);
  }
  throw new Error(`No match \`${type}\` block`);
}
let nanoid = (size = 21) => {
  let id = "";
  let bytes = crypto.getRandomValues(new Uint8Array(size));
  while (size--) {
    let byte = bytes[size] & 63;
    if (byte < 36) {
      id += byte.toString(36);
    } else if (byte < 62) {
      id += (byte - 26).toString(36).toUpperCase();
    } else if (byte < 63) {
      id += "_";
    } else {
      id += "-";
    }
  }
  return id;
};
function generateIterationTemplate(option, content) {
  return /* @__PURE__ */ React.createElement(Template, null, /* @__PURE__ */ React.createElement(Raw, null, `
        <!-- htmlmin:ignore -->
        {% for ${option.itemName} in ${option.dataSource} ${option.limit ? `limit:${option.limit}` : ""} %}
        <!-- htmlmin:ignore -->
        `), content, /* @__PURE__ */ React.createElement(Raw, null, " <!-- htmlmin:ignore -->{% endfor %}  <!-- htmlmin:ignore -->"));
}
function generateConditionTemplate(option, content) {
  const { symbol, groups } = option;
  const generateExpression = (condition) => {
    if (condition.operator === Operator.TRUTHY) {
      return condition.left;
    }
    if (condition.operator === Operator.FALSY) {
      return condition.left + " == nil";
    }
    return condition.left + " " + condition.operator + " " + (isNumber(condition.right) ? condition.right : `"${condition.right}"`);
  };
  const uuid = nanoid(5);
  const variables = groups.map((_, index2) => `con_${index2}_${uuid}`);
  const assignExpression = groups.map((item, index2) => {
    return `{% assign ${variables[index2]} = ${item.groups.map(generateExpression).join(` ${item.symbol} `)} %}`;
  }).join("\n");
  const conditionExpression = variables.join(` ${symbol} `);
  return /* @__PURE__ */ React.createElement(Template, null, /* @__PURE__ */ React.createElement(Raw, null, `
        <!-- htmlmin:ignore -->
        ${assignExpression}
        {% if ${conditionExpression} %}
        <!-- htmlmin:ignore -->
        `), content, /* @__PURE__ */ React.createElement(Raw, null, `
        <!-- htmlmin:ignore -->
        {% endif %}
        <!-- htmlmin:ignore -->
        `));
}
class TemplateEngineManager {
  static setTag(option) {
    this.tags[option.name] = option.templateGenerateFn;
  }
  static generateTagTemplate(name) {
    return this.tags[name];
  }
}
__publicField(TemplateEngineManager, "tags", {
  iteration: generateIterationTemplate,
  condition: generateConditionTemplate
});
function isAdvancedBlock(type) {
  return Object.values(AdvancedType).includes(type);
}
export { AdvancedType, BasicType, BlockManager, EMAIL_BLOCK_CLASS_NAME, ImageManager, JsonToMjml, MERGE_TAG_CLASS_NAME, MjmlToJson, Operator, OperatorSymbol, TemplateEngineManager, advancedBlocks, ancestorOf, index as components, createBlockDataByType, createCustomBlock, getChildIdx, getIndexByIdx, getNodeIdxClassName, getNodeIdxFromClassName, getNodeTypeClassName, getNodeTypeFromClassName, getPageIdx, getParenRelativeByType, getParentByIdx, getParentByType, getParentIdx, getSameParent, getSiblingIdx, getValidChildBlocks, getValueByIdx, isAdvancedBlock, isValidBlockData, parseReactBlockToBlockData, standardBlocks };
//# sourceMappingURL=index.es.js.map
