// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

package daprhttproutev1alpha3

const (
	ResourceType = "dapr.io.DaprHttpRoute"
)

type DaprHttpRouteProperties struct {
	AppID string `json:"appID"`
}