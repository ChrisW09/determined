// Code generated by gen.py. DO NOT EDIT.

package expconf

import (
	"github.com/santhosh-tekuri/jsonschema/v2"

	"github.com/determined-ai/determined/master/pkg/schemas"
)

func (r ReproducibilityConfigV0) GetExperimentSeed() *uint32 {
	return r.ExperimentSeed
}

func (r ReproducibilityConfigV0) WithDefaults() ReproducibilityConfigV0 {
	return schemas.WithDefaults(r).(ReproducibilityConfigV0)
}

func (r ReproducibilityConfigV0) Merge(other ReproducibilityConfigV0) ReproducibilityConfigV0 {
	return schemas.Merge(r, other).(ReproducibilityConfigV0)
}

func (r ReproducibilityConfigV0) ParsedSchema() interface{} {
	return schemas.ParsedReproducibilityConfigV0()
}

func (r ReproducibilityConfigV0) SanityValidator() *jsonschema.Schema {
	return schemas.GetSanityValidator("http://determined.ai/schemas/expconf/v0/reproducibility.json")
}

func (r ReproducibilityConfigV0) CompletenessValidator() *jsonschema.Schema {
	return schemas.GetCompletenessValidator("http://determined.ai/schemas/expconf/v0/reproducibility.json")
}