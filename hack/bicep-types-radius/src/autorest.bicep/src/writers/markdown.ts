// ------------------------------------------------------------
// Copyright 2023 The Radius Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ------------------------------------------------------------.
import { Dictionary, keys, orderBy } from 'lodash';
import { ArrayType, BuiltInType, DiscriminatedObjectType, getBuiltInTypeKindLabel, getObjectTypePropertyFlagsLabels, getScopeTypeLabels, ObjectTypeProperty, ObjectType, ResourceFunctionType, ResourceType, StringLiteralType, TypeBase, TypeBaseKind, TypeReference, UnionType, BicepType, TypeIndex, CrossFileTypeReference } from '../types';
import { groupBy } from '../utils';

class MarkdownFile {
  private output = '';

  generateAnchorLink(name: string) {
    return `[${name}](#${name.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()})`;
  }

  writeHeading(nesting: number, message: string) {
    this.output += `${'#'.repeat(nesting)} ${message}`;
    this.writeNewLine();
  }

  writeBullet(key: string, value: string) {
    this.output += `* **${key}**: ${value}`;
    this.writeNewLine();
  }

  writeNotaBene(content: string) {
    this.output += `*${content}*`;
    this.writeNewLine();
  }

  writeNewLine() {
    this.output += '\n';
  }

  toString() {
    return this.output;
  }
}

export function writeMarkdown(provider: string, apiVersion: string, types: BicepType[]) {
  let output = '';

  function getTypeName(types: BicepType[], typeReference: TypeReference): string {
    const type = types[typeReference.index];
    switch (type.type) {
      case TypeBaseKind.BuiltInType:
        return getBuiltInTypeKindLabel((type as BuiltInType).kind).toLowerCase();
      case TypeBaseKind.ObjectType:
        return generateAnchorLink((type as ObjectType).name);
      case TypeBaseKind.ArrayType:
        return `${getTypeName(types, (type as ArrayType).itemType)}[]`;
      case TypeBaseKind.ResourceType:
        return (type as ResourceType).name;
      case TypeBaseKind.ResourceFunctionType: {
        const functionType = type as ResourceFunctionType;
        return `${functionType.name} (${functionType.resourceType}@${functionType.apiVersion})`;
      }
      case TypeBaseKind.UnionType: {
        const elements = (type as UnionType).elements.map(x => getTypeName(types, x));
        return elements.sort().join(' | ');
      }
      case TypeBaseKind.StringLiteralType:
        return `'${(type as StringLiteralType).value}'`;
      case TypeBaseKind.DiscriminatedObjectType:
        return generateAnchorLink((type as DiscriminatedObjectType).name);
      default:
        throw `Unrecognized type`;
    }
  }

  function generateAnchorLink(name: string) {
    return `[${name}](#${name.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()})`;
  }

  function writeTypeProperty(types: BicepType[], name: string, property: ObjectTypeProperty) {
    const flagsString = property.flags ? ` (${getObjectTypePropertyFlagsLabels(property.flags).join(', ')})` : '';
    const descriptionString = property.description ? `: ${property.description}` : '';
    writeBullet(name, `${getTypeName(types, property.type)}${flagsString}${descriptionString}`);
  }

  function writeHeading(nesting: number, message: string) {
    output += `${'#'.repeat(nesting)} ${message}`;
    writeNewLine();
  }

  function writeBullet(key: string, value: string) {
    output += `* **${key}**: ${value}`;
    writeNewLine();
  }

  function writeNewLine() {
    output += '\n';
  }

  function findTypesToWrite(types: BicepType[], typesToWrite: BicepType[], typeReference: TypeReference) {
    function processTypeLinks(typeReference: TypeReference, skipParent: boolean) {
      // this is needed to avoid circular type references causing stack overflows
      if (typesToWrite.indexOf(types[typeReference.index]) === -1) {
        if (!skipParent) {
          typesToWrite.push(types[typeReference.index]);
        }

        findTypesToWrite(types, typesToWrite, typeReference);
      }
    }

    const type = types[typeReference.index];
    switch (type.type) {
      case TypeBaseKind.ArrayType: {
        const arrayType = type as ArrayType;
        processTypeLinks(arrayType.itemType, false);

        return;
      }
      case TypeBaseKind.ObjectType: {
        const objectType = type as ObjectType;

        for (const key of sortedKeys(objectType.properties)) {
          processTypeLinks(objectType.properties[key].type, false);
        }

        if (objectType.additionalProperties) {
          processTypeLinks(objectType.additionalProperties, false);
        }

        return;
      }
      case TypeBaseKind.DiscriminatedObjectType: {
        const discriminatedObjectType = type as DiscriminatedObjectType;

        for (const key of sortedKeys(discriminatedObjectType.baseProperties)) {
          processTypeLinks(discriminatedObjectType.baseProperties[key].type, false);
        }

        for (const key of sortedKeys(discriminatedObjectType.elements)) {
          const element = discriminatedObjectType.elements[key];
          // Don't display discriminated object elements as individual types
          processTypeLinks(element, true);
        }

        return;
      }
    }
  }

  function sortedKeys<T>(dictionary: Dictionary<T>) {
    return orderBy(keys(dictionary), k => k.toLowerCase(), 'asc');
  }

  function writeComplexType(types: BicepType[], type: BicepType, nesting: number, includeHeader: boolean) {
    switch (type.type) {
      case TypeBaseKind.ResourceType: {
        const resourceType = type as ResourceType;
        writeHeading(nesting, `Resource ${resourceType.name}`);
        writeBullet("Valid Scope(s)", `${getScopeTypeLabels(resourceType.scopeType).join(', ') || 'Unknown'}`);
        writeComplexType(types, types[resourceType.body.index], nesting, false);

        return;
      }
      case TypeBaseKind.ResourceFunctionType: {
        const resourceFunctionType = type as ResourceFunctionType;
        writeHeading(nesting, `Function ${resourceFunctionType.name} (${resourceFunctionType.resourceType}@${resourceFunctionType.apiVersion})`);
        writeBullet("Resource", resourceFunctionType.resourceType);
        writeBullet("ApiVersion", resourceFunctionType.apiVersion);
        if (resourceFunctionType.input) {
          writeBullet("Input", getTypeName(types, resourceFunctionType.input));
        }
        writeBullet("Output", getTypeName(types, resourceFunctionType.output));

        writeNewLine();
        return;
      }
      case TypeBaseKind.ObjectType: {
        const objectType = type as ObjectType;
        if (includeHeader) {
          writeHeading(nesting, objectType.name);
        }

        writeHeading(nesting + 1, "Properties");
        for (const key of sortedKeys(objectType.properties)) {
          writeTypeProperty(types, key, objectType.properties[key]);
        }

        if (objectType.additionalProperties) {
          writeHeading(nesting + 1, "Additional Properties");
          writeBullet("Additional Properties Type", getTypeName(types, objectType.additionalProperties));
        }

        writeNewLine();
        return;
      }
      case TypeBaseKind.DiscriminatedObjectType: {
        const discriminatedObjectType = type as DiscriminatedObjectType;
        if (includeHeader) {
          writeHeading(nesting, discriminatedObjectType.name);
        }

        writeBullet("Discriminator", discriminatedObjectType.discriminator);
        writeNewLine();

        writeHeading(nesting + 1, "Base Properties");
        for (const propertyName of sortedKeys(discriminatedObjectType.baseProperties)) {
          writeTypeProperty(types, propertyName, discriminatedObjectType.baseProperties[propertyName]);
        }

        for (const key of sortedKeys(discriminatedObjectType.elements)) {
          const element = discriminatedObjectType.elements[key];
          writeComplexType(types, types[element.index], nesting + 1, true);
        }

        writeNewLine();
        return;
      }
    }
  }

  function generateMarkdown(provider: string, apiVersion: string, types: BicepType[]) {
    writeHeading(1, `${provider} @ ${apiVersion}`);
    writeNewLine();

    const resourceTypes = orderBy(types.filter(t => t.type == TypeBaseKind.ResourceType) as ResourceType[], x => x.name.split('@')[0].toLowerCase());
    const resourceFunctionTypes = orderBy(types.filter(t => t.type == TypeBaseKind.ResourceFunctionType) as ResourceFunctionType[], x => x.name.split('@')[0].toLowerCase());
    const typesToWrite: BicepType[] = [...resourceTypes, ...resourceFunctionTypes];

    for (const resourceType of resourceTypes) {
      findTypesToWrite(types, typesToWrite, resourceType.body);
    }

    for (const resourceFunctionType of resourceFunctionTypes) {
      if (resourceFunctionType.input)
      {
        typesToWrite.push(types[resourceFunctionType.input.index]);
        findTypesToWrite(types, typesToWrite, resourceFunctionType.input);
      }
      typesToWrite.push(types[resourceFunctionType.output.index]);
      findTypesToWrite(types, typesToWrite, resourceFunctionType.output);
    }

    for (const type of typesToWrite) {
      writeComplexType(types, type, 2, true);
    }

    return output;
  }

  return generateMarkdown(provider, apiVersion, types);
}

export function writeIndexMarkdown(index: TypeIndex) {
  const md = new MarkdownFile();
  md.writeHeading(1, 'Bicep Types');

  const byProvider = groupBy(Object.keys(index.resources), x => x.split('/')[0].toLowerCase());
  for (const namespace of orderBy(Object.keys(byProvider), x => x.toLowerCase())) {
    md.writeHeading(2, namespace);

    const byResourceType = groupBy(byProvider[namespace], x => x.split('@')[0].toLowerCase());
    for (const resourceType of orderBy(Object.keys(byResourceType), x => x.toLowerCase())) {
      md.writeHeading(3, resourceType);

      for (const typeString of orderBy(byResourceType[resourceType], x => x.toLowerCase())) {
        const version = typeString.split('@')[1];
        const jsonPath = index.resources[typeString].relativePath;
        const anchor = `resource-${typeString.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}`;

        const mdPath = jsonPath.substring(0, jsonPath.toLowerCase().lastIndexOf('.json')) + '.md';

        md.writeBullet('Link', `[${version}](${mdPath}#${anchor})`);
      }

      md.writeNewLine();
    }
  }

  return md.toString();
}