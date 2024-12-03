// Licensed under the Apache License, Version 2.0 . See LICENSE in the repository root for license information.
// Code generated by Microsoft (R) AutoRest Code Generator. DO NOT EDIT.
// Changes may cause incorrect behavior and will be lost if the code is regenerated.

package v20231001preview

import "encoding/json"

func unmarshalEnvironmentComputeClassification(rawMsg json.RawMessage) (EnvironmentComputeClassification, error) {
	if rawMsg == nil || string(rawMsg) == "null" {
		return nil, nil
	}
	var m map[string]any
	if err := json.Unmarshal(rawMsg, &m); err != nil {
		return nil, err
	}
	var b EnvironmentComputeClassification
	switch m["kind"] {
	case "kubernetes":
		b = &KubernetesCompute{}
	default:
		b = &EnvironmentCompute{}
	}
	if err := json.Unmarshal(rawMsg, b); err != nil {
		return nil, err
	}
	return b, nil
}

func unmarshalExtensionClassification(rawMsg json.RawMessage) (ExtensionClassification, error) {
	if rawMsg == nil || string(rawMsg) == "null" {
		return nil, nil
	}
	var m map[string]any
	if err := json.Unmarshal(rawMsg, &m); err != nil {
		return nil, err
	}
	var b ExtensionClassification
	switch m["kind"] {
	case "daprSidecar":
		b = &DaprSidecarExtension{}
	case "kubernetesMetadata":
		b = &KubernetesMetadataExtension{}
	case "kubernetesNamespace":
		b = &KubernetesNamespaceExtension{}
	case "manualScaling":
		b = &ManualScalingExtension{}
	default:
		b = &Extension{}
	}
	if err := json.Unmarshal(rawMsg, b); err != nil {
		return nil, err
	}
	return b, nil
}

func unmarshalExtensionClassificationArray(rawMsg json.RawMessage) ([]ExtensionClassification, error) {
	if rawMsg == nil || string(rawMsg) == "null" {
		return nil, nil
	}
	var rawMessages []json.RawMessage
	if err := json.Unmarshal(rawMsg, &rawMessages); err != nil {
		return nil, err
	}
	fArray := make([]ExtensionClassification, len(rawMessages))
	for index, rawMessage := range rawMessages {
		f, err := unmarshalExtensionClassification(rawMessage)
		if err != nil {
			return nil, err
		}
		fArray[index] = f
	}
	return fArray, nil
}

func unmarshalHealthProbePropertiesClassification(rawMsg json.RawMessage) (HealthProbePropertiesClassification, error) {
	if rawMsg == nil || string(rawMsg) == "null" {
		return nil, nil
	}
	var m map[string]any
	if err := json.Unmarshal(rawMsg, &m); err != nil {
		return nil, err
	}
	var b HealthProbePropertiesClassification
	switch m["kind"] {
	case "exec":
		b = &ExecHealthProbeProperties{}
	case "httpGet":
		b = &HTTPGetHealthProbeProperties{}
	case "tcp":
		b = &TCPHealthProbeProperties{}
	default:
		b = &HealthProbeProperties{}
	}
	if err := json.Unmarshal(rawMsg, b); err != nil {
		return nil, err
	}
	return b, nil
}

func unmarshalRecipePropertiesClassification(rawMsg json.RawMessage) (RecipePropertiesClassification, error) {
	if rawMsg == nil || string(rawMsg) == "null" {
		return nil, nil
	}
	var m map[string]any
	if err := json.Unmarshal(rawMsg, &m); err != nil {
		return nil, err
	}
	var b RecipePropertiesClassification
	switch m["templateKind"] {
	case "bicep":
		b = &BicepRecipeProperties{}
	case "terraform":
		b = &TerraformRecipeProperties{}
	default:
		b = &RecipeProperties{}
	}
	if err := json.Unmarshal(rawMsg, b); err != nil {
		return nil, err
	}
	return b, nil
}

func unmarshalRecipePropertiesClassificationMap(rawMsg json.RawMessage) (map[string]RecipePropertiesClassification, error) {
	if rawMsg == nil || string(rawMsg) == "null" {
		return nil, nil
	}
	var rawMessages map[string]json.RawMessage
	if err := json.Unmarshal(rawMsg, &rawMessages); err != nil {
		return nil, err
	}
	fMap := make(map[string]RecipePropertiesClassification, len(rawMessages))
	for key, rawMessage := range rawMessages {
		f, err := unmarshalRecipePropertiesClassification(rawMessage)
		if err != nil {
			return nil, err
		}
		fMap[key] = f
	}
	return fMap, nil
}

func unmarshalVolumeClassification(rawMsg json.RawMessage) (VolumeClassification, error) {
	if rawMsg == nil || string(rawMsg) == "null" {
		return nil, nil
	}
	var m map[string]any
	if err := json.Unmarshal(rawMsg, &m); err != nil {
		return nil, err
	}
	var b VolumeClassification
	switch m["kind"] {
	case "ephemeral":
		b = &EphemeralVolume{}
	case "persistent":
		b = &PersistentVolume{}
	default:
		b = &Volume{}
	}
	if err := json.Unmarshal(rawMsg, b); err != nil {
		return nil, err
	}
	return b, nil
}

func unmarshalVolumeClassificationMap(rawMsg json.RawMessage) (map[string]VolumeClassification, error) {
	if rawMsg == nil || string(rawMsg) == "null" {
		return nil, nil
	}
	var rawMessages map[string]json.RawMessage
	if err := json.Unmarshal(rawMsg, &rawMessages); err != nil {
		return nil, err
	}
	fMap := make(map[string]VolumeClassification, len(rawMessages))
	for key, rawMessage := range rawMessages {
		f, err := unmarshalVolumeClassification(rawMessage)
		if err != nil {
			return nil, err
		}
		fMap[key] = f
	}
	return fMap, nil
}

func unmarshalVolumePropertiesClassification(rawMsg json.RawMessage) (VolumePropertiesClassification, error) {
	if rawMsg == nil || string(rawMsg) == "null" {
		return nil, nil
	}
	var m map[string]any
	if err := json.Unmarshal(rawMsg, &m); err != nil {
		return nil, err
	}
	var b VolumePropertiesClassification
	switch m["kind"] {
	case "azure.com.keyvault":
		b = &AzureKeyVaultVolumeProperties{}
	default:
		b = &VolumeProperties{}
	}
	if err := json.Unmarshal(rawMsg, b); err != nil {
		return nil, err
	}
	return b, nil
}

