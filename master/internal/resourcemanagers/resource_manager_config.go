package resourcemanagers

import (
	"encoding/json"

	"github.com/pkg/errors"

	"github.com/determined-ai/determined/master/internal/resourcemanagers/kubernetes"
	"github.com/determined-ai/determined/master/pkg/check"
	"github.com/determined-ai/determined/master/pkg/device"
	"github.com/determined-ai/determined/master/pkg/union"
)

const defaultResourcePoolName = "default"

// ResourceManagerConfig hosts configuration fields for the resource manager.
type ResourceManagerConfig struct {
	AgentRM      *AgentResourceManagerConfig      `union:"type,agent" json:"-"`
	KubernetesRM *KubernetesResourceManagerConfig `union:"type,kubernetes" json:"-"`
}

// MarshalJSON implements the json.Marshaler interface.
func (r ResourceManagerConfig) MarshalJSON() ([]byte, error) {
	return union.Marshal(r)
}

// UnmarshalJSON implements the json.Unmarshaler interface.
func (r *ResourceManagerConfig) UnmarshalJSON(data []byte) error {
	if err := union.Unmarshal(data, r); err != nil {
		return err
	}

	type DefaultParser *ResourceManagerConfig
	if err := json.Unmarshal(data, DefaultParser(r)); err != nil {
		return err
	}

	// Fill in the default config.
	if r.AgentRM == nil && r.KubernetesRM == nil {
		r.AgentRM = &AgentResourceManagerConfig{
			Scheduler: &SchedulerConfig{
				FittingPolicy: defaultFitPolicy,
			},
			DefaultComputeResourcePool: defaultResourcePoolName,
			DefaultAuxResourcePool:     defaultResourcePoolName,
		}
	}
	return nil
}

// AgentResourceManagerConfig hosts configuration fields for the determined resource manager.
type AgentResourceManagerConfig struct {
	Scheduler                  *SchedulerConfig `json:"scheduler"`
	DefaultAuxResourcePool     string           `json:"default_aux_resource_pool"`
	DefaultComputeResourcePool string           `json:"default_compute_resource_pool"`
	// Deprecated: use DefaultAuxResourcePool instead.
	DefaultCPUResourcePool string `json:"default_cpu_resource_pool,omitempty"`
	// Deprecated: use DefaultComputeResourcePool instead.
	DefaultGPUResourcePool string `json:"default_gpu_resource_pool,omitempty"`
}

// UnmarshalJSON implements the json.Unmarshaler interface.
func (a *AgentResourceManagerConfig) UnmarshalJSON(data []byte) error {
	type DefaultParser *AgentResourceManagerConfig
	if err := json.Unmarshal(data, DefaultParser(a)); err != nil {
		return err
	}

	if a.DefaultAuxResourcePool == "" && a.DefaultCPUResourcePool != "" {
		a.DefaultAuxResourcePool = a.DefaultCPUResourcePool
	}
	if a.DefaultComputeResourcePool == "" && a.DefaultGPUResourcePool != "" {
		a.DefaultComputeResourcePool = a.DefaultGPUResourcePool
	}

	if a.DefaultComputeResourcePool == "" {
		a.DefaultComputeResourcePool = defaultResourcePoolName
	}
	if a.DefaultAuxResourcePool == "" {
		a.DefaultAuxResourcePool = defaultResourcePoolName
	}
	a.DefaultCPUResourcePool = ""
	a.DefaultGPUResourcePool = ""

	return nil
}

// Validate implements the check.Validatable interface.
func (a AgentResourceManagerConfig) Validate() []error {
	return []error{
		check.NotEmpty(a.DefaultAuxResourcePool, "default_aux_resource_pool should be non-empty"),
		check.NotEmpty(a.DefaultComputeResourcePool, "default_compute_resource_pool should be non-empty"),
	}
}

// KubernetesResourceManagerConfig hosts configuration fields for the kubernetes resource manager.
type KubernetesResourceManagerConfig struct {
	Namespace                string                             `json:"namespace"`
	MaxSlotsPerPod           int                                `json:"max_slots_per_pod"`
	MasterServiceName        string                             `json:"master_service_name"`
	LeaveKubernetesResources bool                               `json:"leave_kubernetes_resources"`
	DefaultScheduler         string                             `json:"default_scheduler"`
	SlotType                 device.Type                        `json:"slot_type"`
	SlotResourceRequests     kubernetes.PodSlotResourceRequests `json:"slot_resource_requests"`
}

var defaultKubernetesResourceManagerConfig = KubernetesResourceManagerConfig{
	SlotType: device.GPU, // default to CUDA-backed slots.
}

// UnmarshalJSON implements the json.Unmarshaler interface.
func (k *KubernetesResourceManagerConfig) UnmarshalJSON(data []byte) error {
	*k = defaultKubernetesResourceManagerConfig
	type DefaultParser *KubernetesResourceManagerConfig
	return json.Unmarshal(data, DefaultParser(k))
}

// Validate implements the check.Validatable interface.
func (k KubernetesResourceManagerConfig) Validate() []error {
	var checkSlotType error
	switch k.SlotType {
	case device.CPU, device.GPU:
		break
	default:
		checkSlotType = errors.Errorf("slot_type must be either gpu or cpu")
	}

	var checkCPUResource error
	if k.SlotType == device.CPU {
		checkCPUResource = check.GreaterThan(
			k.SlotResourceRequests.CPU, float32(0), "slot_resource_requests.cpu must be > 0")
	}
	return []error{
		check.GreaterThanOrEqualTo(k.MaxSlotsPerPod, 0, "max_slots_per_pod must be >= 0"),
		checkSlotType,
		checkCPUResource,
	}
}
