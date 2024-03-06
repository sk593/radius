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
import { Dictionary, filter, keys, orderBy } from 'lodash';
import { BicepType, ArrayType, BuiltInType, DiscriminatedObjectType, getBuiltInTypeKindLabel, getObjectTypePropertyFlagsLabels, getScopeTypeLabels, ObjectTypeProperty, ObjectType, ResourceFunctionType, ResourceType, StringLiteralType, TypeBaseKind, TypeReference, UnionType } from 'bicep-types';

export function writeTableMarkdown(provider: string, apiVersion: string, resourceTypes: ResourceType[], types: BicepType[]) {
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
        const elements = (type as UnionType).elements.map((x: any) => getTypeName(types, x));
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
    const flagsString = property.flags ? `${getObjectTypePropertyFlagsLabels(property.flags).join(', ')}` : '';
    const descriptionString = property.description ? property.description : '';
    writeTableEntry(name, getTypeName(types, property.type), flagsString, descriptionString);
  }

  function writeTableHeading(){
    output += `| Property | Type | Description |\n`;
    output += `|----------|------|-------------|\n`;
  }

  function writeTableEntry(name: string, type: string, flags: string, description: string){
    const flagString = flags ? `<br />_(${flags})_ ` : '';
    output += `| **${name}** | ${type} | ${description} ${flagString}|\n`;
  }

  function writeHeading(nesting: number, message: string) {
    output += `${'#'.repeat(nesting)} ${message}`;
    writeNewLine();
  }

  function writeBullet(key: string, value: string) {
    output += `* **${key}**`;
    if (value != "") {
      output += `: ${value}`;
    }
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
        writeHeading(nesting, `Top-Level Resource`);
        // temporarily removing scope as it's not applicable
        // writeBullet("Valid Scope(s)", `${getScopeTypeLabels(resourceType.ScopeType).join(', ') || 'Unknown'}`);
        writeComplexType(types, types[resourceType.body.index], nesting, false);

        return;
      }
      case TypeBaseKind.ResourceFunctionType: {
        const resourceFunctionType = type as ResourceFunctionType;
        writeHeading(nesting, `Function ${resourceFunctionType.name} (${resourceFunctionType.resourceType}@${resourceFunctionType.apiVersion})`);
        writeNewLine();
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

        writeNewLine();
        writeHeading(nesting + 1, "Properties");
        writeNewLine();

        if (Object.keys(objectType.properties).length === 0) {
          writeBullet("none", "");
          writeNewLine();
        }
        else {
          writeTableHeading();
          for (const key of sortedKeys(objectType.properties)) {
            writeTypeProperty(types, key, objectType.properties[key]);
          }
        }

        if (objectType.additionalProperties) {
          writeHeading(nesting + 1, "Additional Properties");
          writeNewLine();
          writeBullet("Additional Properties Type", getTypeName(types, objectType.additionalProperties));
        }

        writeNewLine();
        return;
      }
      case TypeBaseKind.DiscriminatedObjectType: {
        const discriminatedObjectType = type as DiscriminatedObjectType;
        if (includeHeader) {
          writeHeading(nesting, discriminatedObjectType.name);
          writeNewLine();
        }

        writeBullet("Discriminator", discriminatedObjectType.discriminator);
        writeNewLine();

        writeHeading(nesting + 1, "Base Properties");
        writeNewLine();
        if (Object.keys(discriminatedObjectType.baseProperties).length === 0) {
          writeBullet("none", "");
          writeNewLine();
        }
        else {
          writeTableHeading();
          for (const propertyName of sortedKeys(discriminatedObjectType.baseProperties)) {
            writeTypeProperty(types, propertyName, discriminatedObjectType.baseProperties[propertyName]);
          }
        }

        writeNewLine();
        
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

    const resourceFunctionTypes = orderBy(types.filter(t => t.type == TypeBaseKind.ResourceFunctionType) as ResourceFunctionType[], x => x.name.split('@')[0].toLowerCase());
    const filteredFunctionTypes = resourceFunctionTypes.filter(x => resourceTypes.some(y => x.resourceType.toLowerCase() === y.name.split('@')[0].toLowerCase()));
    const typesToWrite: BicepType[] = [...resourceTypes, ...filteredFunctionTypes];

    for (const resourceType of resourceTypes) {
      findTypesToWrite(types, typesToWrite, resourceType.body);
    }

    for (const resourceFunctionType of filteredFunctionTypes) {
      if (resourceFunctionType.input) {
        typesToWrite.push(types[resourceFunctionType.input.index]);
        findTypesToWrite(types, typesToWrite, resourceFunctionType.input);
      }
      typesToWrite.push(types[resourceFunctionType.output.index]);
      findTypesToWrite(types, typesToWrite, resourceFunctionType.output);
    }

    for (const type of typesToWrite) {
      writeComplexType(types, type, 3, true);
    }

    return output;
  }

  return generateMarkdown(provider, apiVersion, types);
}