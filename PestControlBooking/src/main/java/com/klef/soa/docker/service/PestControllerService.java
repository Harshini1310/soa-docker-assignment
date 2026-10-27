
package com.klef.soa.docker.service;

import java.util.List;
import com.klef.soa.docker.entity.PestControllerEntity;

public interface PestControllerService {

    PestControllerEntity addPest(PestControllerEntity p);

    List<PestControllerEntity> displayAll();

    PestControllerEntity displayById(Long id);

    PestControllerEntity updatePest(Long id, PestControllerEntity p);

    String deletePest(Long id);
}
