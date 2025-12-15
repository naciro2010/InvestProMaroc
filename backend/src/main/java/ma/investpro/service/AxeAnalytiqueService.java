package ma.investpro.service;

import lombok.RequiredArgsConstructor;
import ma.investpro.dto.AxeAnalytiqueDTO;
import ma.investpro.entity.AxeAnalytique;
import ma.investpro.exception.ResourceNotFoundException;
import ma.investpro.repository.AxeAnalytiqueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AxeAnalytiqueService {

    private final AxeAnalytiqueRepository axeAnalytiqueRepository;

    public List<AxeAnalytiqueDTO> getAll() {
        return axeAnalytiqueRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public List<AxeAnalytiqueDTO> getAllActive() {
        return axeAnalytiqueRepository.findByActifTrue().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public AxeAnalytiqueDTO getById(Long id) {
        AxeAnalytique axe = axeAnalytiqueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Axe analytique", "id", id));
        return toDTO(axe);
    }

    public List<AxeAnalytiqueDTO> search(String search) {
        return axeAnalytiqueRepository.search(search).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public AxeAnalytiqueDTO create(AxeAnalytiqueDTO dto) {
        if (axeAnalytiqueRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Un axe analytique avec le code " + dto.getCode() + " existe déjà");
        }

        AxeAnalytique axe = toEntity(dto);
        axe.setActif(true);
        AxeAnalytique saved = axeAnalytiqueRepository.save(axe);
        return toDTO(saved);
    }

    @Transactional
    public AxeAnalytiqueDTO update(Long id, AxeAnalytiqueDTO dto) {
        AxeAnalytique axe = axeAnalytiqueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Axe analytique", "id", id));

        if (!axe.getCode().equals(dto.getCode()) && axeAnalytiqueRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Un axe analytique avec le code " + dto.getCode() + " existe déjà");
        }

        updateEntityFromDTO(axe, dto);
        AxeAnalytique updated = axeAnalytiqueRepository.save(axe);
        return toDTO(updated);
    }

    @Transactional
    public void delete(Long id) {
        AxeAnalytique axe = axeAnalytiqueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Axe analytique", "id", id));
        axe.setActif(false);
        axeAnalytiqueRepository.save(axe);
    }

    private AxeAnalytiqueDTO toDTO(AxeAnalytique entity) {
        return AxeAnalytiqueDTO.builder()
            .id(entity.getId())
            .code(entity.getCode())
            .libelle(entity.getLibelle())
            .type(entity.getType())
            .description(entity.getDescription())
            .actif(entity.getActif())
            .build();
    }

    private AxeAnalytique toEntity(AxeAnalytiqueDTO dto) {
        return AxeAnalytique.builder()
            .code(dto.getCode())
            .libelle(dto.getLibelle())
            .type(dto.getType())
            .description(dto.getDescription())
            .build();
    }

    private void updateEntityFromDTO(AxeAnalytique entity, AxeAnalytiqueDTO dto) {
        entity.setCode(dto.getCode());
        entity.setLibelle(dto.getLibelle());
        entity.setType(dto.getType());
        entity.setDescription(dto.getDescription());
        if (dto.getActif() != null) {
            entity.setActif(dto.getActif());
        }
    }
}
