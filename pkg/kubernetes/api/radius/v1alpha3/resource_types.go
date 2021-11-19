// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

package v1alpha3

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
)

// ResourceSpec defines the desired state of Resource
type ResourceSpec struct {
	// +kubebuilder:pruning:PreserveUnknownFields
	// +kubebuilder:validation:PreserveUnknownFields
	Template *runtime.RawExtension `json:"template,omitempty"`

	Application string `json:"application,omitempty"`

	Resource string `json:"resource,omitempty"`
}

// ResourceStatus defines the observed state of Resource
type ResourceStatus struct {
	// +optional
	// +kubebuilder:pruning:PreserveUnknownFields
	// +kubebuilder:validation:PreserveUnknownFields
	ComputedValues *runtime.RawExtension `json:"computedValues,omitempty"`

	// +optional
	// +kubebuilder:pruning:PreserveUnknownFields
	// +kubebuilder:validation:PreserveUnknownFields
	SecretValues *runtime.RawExtension `json:"secretValues,omitempty"`

	// +optional
	Resources map[string]*OutputResource `json:"resources,omitempty"`

	// ObservedGeneration captures the last generation
	// that was captured and completed by the reconciler
	// +optional
	ObservedGeneration int64 `json:"observedGeneration,omitempty"`

	// Conditions represents the latest available observations of an object's current state.
	Conditions []metav1.Condition `json:"conditions,omitempty"`

	// The readable status "phrase" of the resource.
	Phrase string `json:"phrase,omitempty"`
}

// OutputResourceStatus defines the observed state of an output resource
type OutputResourceStatus struct {
	ProvisioningState             string `json:"provisioningState,omitempty"`
	ProvisioningStateErrorDetails string `json:"provisioningStateErrorDetails,omitempty"`
	HealthState                   string `json:"healthState,omitempty"`
	HealthStateErrorDetails       string `json:"healthStateErrorDetails,omitempty"`
}

// OutputResource defines the schema for individual output resource of a Radius resource
type OutputResource struct {
	Resource corev1.ObjectReference `json:"resource,omitempty"`
	Status   OutputResourceStatus   `json:"status,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:resource:categories={"all","radius"}
//+kubebuilder:subresource:status
//+kubebuilder:printcolumn:name="Application",type="string",JSONPath=".spec.application"
//+kubebuilder:printcolumn:name="Resource",type="string",JSONPath=".spec.resource"
//+kubebuilder:printcolumn:name="Status",type="string",JSONPath=".status.phrase"

// Resource is the Schema for the resources API
type Resource struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ResourceSpec   `json:"spec,omitempty"`
	Status ResourceStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// ResourceList contains a list of Resource
type ResourceList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Resource `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Resource{}, &ResourceList{})
}
