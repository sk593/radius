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
import { BicepType, TypeReference } from 'bicep-types';

export function writeJson(types: BicepType[]) {
  const output = writeTypesJsonMapper(types);

  return JSON.stringify(output, writeTypesJsonReplacer, 2);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function writeTypesJsonReplacer(key: any, value: any) {
  if (value instanceof TypeReference) {
    return {
      "$ref": `#/${value.index}`,
    };
  }

  return value;
}

function writeTypesJsonMapper(types: BicepType[]) {
  return types.map(t => {
    const { type, ...rest } = t;
    return {
      // System.Text.Json uses this as the polymorphic discriminator
      // https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/polymorphism
      '$type': type,
      ...rest,
    };
  });
}