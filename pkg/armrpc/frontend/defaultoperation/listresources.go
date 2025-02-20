/*
Copyright 2023 The Radius Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package defaultoperation

import (
	"context"
	"net/http"

	v1 "github.com/radius-project/radius/pkg/armrpc/api/v1"
	ctrl "github.com/radius-project/radius/pkg/armrpc/frontend/controller"
	"github.com/radius-project/radius/pkg/armrpc/rest"
	"github.com/radius-project/radius/pkg/components/database"
)

// ListResources is the controller implementation to get the list of resources in resource group.
type ListResources[P interface {
	*T
	v1.ResourceDataModel
}, T any] struct {
	ctrl.Operation[P, T]
	listRecursiveQuery bool
}

// NewListResources creates a new ListResources instance.
func NewListResources[P interface {
	*T
	v1.ResourceDataModel
}, T any](opts ctrl.Options, ctrlOpts ctrl.ResourceOptions[T]) (*ListResources[P, T], error) {
	return &ListResources[P, T]{ctrl.NewOperation[P](opts, ctrlOpts), ctrlOpts.ListRecursiveQuery}, nil
}

// Run queries the resource data store with a given type and scope and returns the paginated resource list. An internal error
// is returned if the query fails.
func (e *ListResources[P, T]) Run(ctx context.Context, w http.ResponseWriter, req *http.Request) (rest.Response, error) {
	serviceCtx := v1.ARMRequestContextFromContext(ctx)

	query := database.Query{
		RootScope:      serviceCtx.ResourceID.RootScope(),
		ResourceType:   serviceCtx.ResourceID.Type(),
		ScopeRecursive: e.listRecursiveQuery,
	}

	result, err := e.DatabaseClient().Query(ctx, query, database.WithPaginationToken(serviceCtx.SkipToken), database.WithMaxQueryItemCount(serviceCtx.Top))
	if err != nil {
		return nil, err
	}

	pagination, err := e.createPaginationResponse(ctx, req, result)

	return rest.NewOKResponse(pagination), err
}

func (e *ListResources[P, T]) createPaginationResponse(ctx context.Context, req *http.Request, result *database.ObjectQueryResult) (*v1.PaginatedList, error) {
	serviceCtx := v1.ARMRequestContextFromContext(ctx)

	items := []any{}
	for _, item := range result.Items {
		resource := new(T)
		if err := item.As(resource); err != nil {
			return nil, err
		}

		versioned, err := e.ResponseConverter()(resource, serviceCtx.APIVersion)
		if err != nil {
			return nil, err
		}

		items = append(items, versioned)
	}

	return &v1.PaginatedList{
		Value:    items,
		NextLink: ctrl.GetNextLinkURL(ctx, req, result.PaginationToken),
	}, nil
}
