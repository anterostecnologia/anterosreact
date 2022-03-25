import {
  AdvancedBlock,
  Operator,
} from '@core/blocks/advanced/generateAdvancedBlock';
import { Template, Raw } from '@core/components';
import { isNumber } from 'lodash';
import React from 'react';
import { nanoid } from 'nanoid';

function generateIterationTemplate(
  option: NonNullable<AdvancedBlock['data']['value']['iteration']>,
  content: React.ReactElement
) {
  return (
    <Template>
      <Raw>
        {`
        <!-- htmlmin:ignore -->
        {% for ${option.itemName} in ${option.dataSource} ${option.limit ? `limit:${option.limit}` : ''
          } %}
        <!-- htmlmin:ignore -->
        `}
      </Raw>
      {content}
      <Raw>
        {' <!-- htmlmin:ignore -->{% endfor %}  <!-- htmlmin:ignore -->'}
      </Raw>
    </Template>
  );
}

function generateConditionTemplate(
  option: NonNullable<AdvancedBlock['data']['value']['condition']>,
  content: React.ReactElement
) {
  const { symbol, groups } = option;

  const generateExpression = (condition: {
    left: string | number;
    operator: Operator;
    right: string | number;
  }) => {
    if (condition.operator === Operator.TRUTHY) {
      return condition.left;
    }
    if (condition.operator === Operator.FALSY) {
      return condition.left + ' == nil';
    }
    return (
      condition.left +
      ' ' +
      condition.operator +
      ' ' +
      (isNumber(condition.right) ? condition.right : `"${condition.right}"`)
    );
  };
  const uuid = nanoid(5);
  const variables = groups.map((_, index) => `con_${index}_${uuid}`);

  const assignExpression = groups
    .map((item, index) => {
      return `{% assign ${variables[index]} = ${item.groups
        .map(generateExpression)
        .join(` ${item.symbol} `)} %}`;
    })
    .join('\n');
  const conditionExpression = variables.join(` ${symbol} `);

  return (
    <Template>
      <Raw>
        {`
        <!-- htmlmin:ignore -->
        ${assignExpression}
        {% if ${conditionExpression} %}
        <!-- htmlmin:ignore -->
        `}
      </Raw>
      {content}
      <Raw>
        {`
        <!-- htmlmin:ignore -->
        {% endif %}
        <!-- htmlmin:ignore -->
        `}
      </Raw>
    </Template>
  );
}

interface IterationTemplate {
  name: 'iteration';
  templateGenerateFn: typeof generateIterationTemplate;
}

interface ConditionTemplate {
  name: 'condition';
  templateGenerateFn: typeof generateConditionTemplate;
}

export class TemplateEngineManager {
  private static tags = {
    iteration: generateIterationTemplate,
    condition: generateConditionTemplate,
  };

  public static setTag(option: IterationTemplate | ConditionTemplate) {
    this.tags[option.name] = option.templateGenerateFn as any;
  }

  public static generateTagTemplate<
    T extends keyof typeof TemplateEngineManager['tags']
  >(name: T): typeof TemplateEngineManager['tags'][T] {
    return this.tags[name];
  }
}
