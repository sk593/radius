// Code generated by MockGen. DO NOT EDIT.
// Source: github.com/project-radius/radius/pkg/connectorrp/renderers (interfaces: Renderer)

// Package renderers is a generated GoMock package.
package renderers

import (
	context "context"
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
	conv "github.com/project-radius/radius/pkg/armrpc/api/conv"
)

// MockRenderer is a mock of Renderer interface.
type MockRenderer struct {
	ctrl     *gomock.Controller
	recorder *MockRendererMockRecorder
}

// MockRendererMockRecorder is the mock recorder for MockRenderer.
type MockRendererMockRecorder struct {
	mock *MockRenderer
}

// NewMockRenderer creates a new mock instance.
func NewMockRenderer(ctrl *gomock.Controller) *MockRenderer {
	mock := &MockRenderer{ctrl: ctrl}
	mock.recorder = &MockRendererMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockRenderer) EXPECT() *MockRendererMockRecorder {
	return m.recorder
}

// Render mocks base method.
func (m *MockRenderer) Render(arg0 context.Context, arg1 conv.DataModelInterface, arg2 RenderOptions) (RendererOutput, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Render", arg0, arg1, arg2)
	ret0, _ := ret[0].(RendererOutput)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Render indicates an expected call of Render.
func (mr *MockRendererMockRecorder) Render(arg0, arg1, arg2 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Render", reflect.TypeOf((*MockRenderer)(nil).Render), arg0, arg1, arg2)
}
